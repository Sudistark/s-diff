define([
    'script-loader!contrib/require',
    'script-loader!profiles/shared',
    'profiles/alias.json',
    'output_web.json',
    'util/console',
    'splunk.util',
    'underscore',
    'coreAliases',
    'util/env'],
function(nada, blada, sharedAliases, searchHeadModules,
    console,
    splunkUtil, _, coreAliases, env) {
    coreAliases = coreAliases.resolve.alias;
    var requirejsRequire = window.requirejs;
    var requirejsDefine = window.define;
     /* globals __webpack_require__: false */
    var webpackModules = __webpack_require__.c;

    // This is a 'Set' of the webpack modules that have already been exposed to
    // requirejs.
    var requirejsModulesLoaded = {};

    // This is a 'Set' of modules that are considered public and ok to require.
    // All other core modules will show a warning when being required.
    // Note: It is prepopulated with the modules that can be auto-injected by
    // requirejs.
    var whiteList = {
        require: true,
        exports: true,
        module: true
    };
    var dependencies = {};
    var url = splunkUtil.make_url('static/js');
    requirejsRequire.config({
        baseUrl: url
    });

    if (env.PRODUCTION) {
        requirejsRequire.config({
            waitSeconds: 0
        });
    }

    /**
     * A shim for requirejs require calls that calls `exposeModules` on the
     * array of dependencies before delegating to the requirejs function.
     */
    function shimmedRequirejsRequire(modules) {
        if (_.isArray(modules)) {
            exposeModules(modules, false, true);
        }
        warnOnPrivateModuleRequests(modules);
        return requirejsRequire.apply(null, arguments);
    }

    /**
     * A shim for requirejs define calls that calls `exposedModules` on the
     * array of dependencies before delegating to the requirejs function.
     */
    function shimmedRequirejsDefine(name, deps, callback) {
        var modulesToExpose = _.isArray(name) ? name :
            _.isArray(deps) ? deps :
            parseDeps(name);
        exposeModules(modulesToExpose);
        warnOnPrivateModuleRequests(modulesToExpose);
        requirejsDefine.apply(null, arguments);
    }

    function getShim(dependencies, dependency) {
        var isFound = false;
        var arr = Object.keys(dependencies);
        for (var i = 0; i<arr.length; i++) {
            var key = arr[i];
            var value = dependencies[key];
            if ((/\$$/.test(key) && key.slice(0, -1) === dependency) ||
                (key === dependency)) {
                    dependency = value;
                    isFound = true;
                    break;
            } else {
                dependency = dependency.replace(key, value);
            }
        }
        return {dependency: dependency, isFound: isFound};
    }

    /**
    * This function enables sharing of modules between webpack and requirejs.
    * If a module has already been loaded by webpack, it will expose it to
    * requirejs using the requirejs, preventing double loading of the module.
    *
    * @param {Object|String[]} modules - Either a map with module ids as keys
    * and the modules as values or an Array of module ids. If an array is
    * passed, the ids will be used to look up the modules in the webpack module
    * cache, after applying the webpack alias logic to the id.
    * @param {Boolean} [isWhiteList = false] - True if the modules should be
    * added to the whiteList. Requests for modules not in the whiteList will
    * produce a warning.
    */
    function exposeModules(modules, isWhiteList, sendTelemetry) {
        dependencies = {};
        var webpackDependencies = {};
        var searchHeadDependencies = {};
        if (!_.isArray(modules)) {
            _.forEach(modules, function(webpackModule, moduleId) {
                if (isWhiteList) {
                    whiteList[moduleId] = true;
                }
                exposeModule(moduleId, webpackModule);
            });
        } else {
            modules.forEach(function(requirejsId) {
                if (isWhiteList) {
                    whiteList[requirejsId] = true;
                }

                // Early exit if the module has already been defined in requirejs.
                if (requirejsModulesLoaded[requirejsId]) {
                    if (!webpackDependencies[requirejsId]) {
                        // check for aliases before pushing
                        var _obj = getShim(coreAliases, requirejsId);
                        var foundInDeps = _obj.isFound;
                        var dep = _obj.dependency;
                        if (foundInDeps) {
                            webpackDependencies[dep] = true;
                        } else {
                            _obj = getShim(sharedAliases, requirejsId);
                            foundInDeps = _obj.isFound;
                            dep = _obj.dependency;
                            webpackDependencies[dep] = true;
                        }
                    }
                    return;
                }

                // For each module in the request we apply the webpack alias logic
                // to obtain the moduleId used by webpack.
                // The webpack alias logic is similar to a replace algorithm but a
                // but more clever:
                //  - If the the key ends with $ only the exact match (without the
                // $) will be replaced.
                //  - If the value is a relative path it will be relative to the
                // file containing the require. (THIS IS NOT IMPLEMENTED HERE and is
                // not currently used by any of our aliases in coreAliases.config).
                //
                // See https://webpack.github.io/docs/configuration.html#resolve-alias
                function findInDeps(dependencies, _dep) {
                    var obj = getShim(dependencies, _dep);
                    var foundInDeps = obj.isFound;
                    var dep = obj.dependency;
                    // If the module has already been loaded by webpack, expose it to
                    // requirejs with define.
                    if (_.has(webpackModules, dep)) {
                        webpackDependencies[dep] = true;
                        exposeModule(requirejsId, webpackModules[dep].exports);
                    } else {
                        var withIndex = dep;
                        withIndex += dep.endsWith('/') ? 'index' : '/index';
                        if (searchHeadModules.indexOf(dep) > -1 ||
                            searchHeadModules.indexOf(withIndex) > -1 || foundInDeps) {
                            searchHeadDependencies[dep] = true;
                        }
                    }
                    return foundInDeps;
                }

                var found = findInDeps(coreAliases, requirejsId);
                if (!found) {
                    findInDeps(sharedAliases, requirejsId);
                }
            });
        }
        if (!sendTelemetry) {
            return;
        }
        dependencies = {
            webpackDependencies: Object.keys(webpackDependencies),
            searchHeadDependencies: Object.keys(searchHeadDependencies)
        };
    }

    function exposeModule(requirejsId, exportedMod) {
        if (requirejsModulesLoaded[requirejsId]) {
            return;
        }
        requirejsModulesLoaded[requirejsId] = true;
        requirejsDefine(requirejsId, function () {
            return exportedMod;
        });
        // Force the module to load by requiring it!
        requirejsRequire([requirejsId]);
    }

    function warnOnPrivateModuleRequests(moduleIds) {
        if (!_.isArray(moduleIds)) {
            moduleIds = [moduleIds];
        }
        moduleIds.forEach(function(moduleId) {
            moduleId = moduleId.substring(moduleId.indexOf('!') + 1);
            if (moduleId &&
                !_.has(whiteList, moduleId) &&
                !/^\.\.\/app\/|^app\//.test(moduleId) &&
                !/^api\//.test(moduleId)) {
                console.warn('Warning: ' + moduleId +
                    ' is a private module and may not be supported in the future.');
            }
        });
    }

    function getInternalDependencies() {
        return dependencies;
    }

    /**
     * This function is copied from `contrib/require.js`. It parses commonjs
     * style require statements from an amd module and returns an array of
     * dependencies.
     *
     * @param {Function} factory
     * @returns {String[]} An Array of dependencies
     */
    var commentRegExp = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg;
    var cjsRequireRegExp = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g;
    function parseDeps(factory) {
        var deps = [];
        if (factory.length) {
            factory
                .toString()
                .replace(commentRegExp, '')
                .replace(cjsRequireRegExp, function(match, dep) {
                    deps.push(dep);
                });
        }
        return deps;
    }

    shimmedRequirejsRequire.config = requirejsRequire.config;
    shimmedRequirejsRequire.exposeModules = exposeModules;
    shimmedRequirejsRequire.getInternalDependencies = getInternalDependencies;

    // Override the requirejs globals with our shimmed versions.
    window.requirejs = window.require = shimmedRequirejsRequire;
    shimmedRequirejsDefine.amd = requirejsDefine.amd;
    window.define = shimmedRequirejsDefine;
    return shimmedRequirejsRequire;
});
