# simpleXML customjs telemetry
First written on 2/23/2021

## Why record telemetry on the custom JavaScript in SimpleXML dashboards?
We provide a number of our own dependencies as part of the SimpleXML API. To maintain this API we need relevant usage telemetry. We do not want to collect dependencies written by customers.

## What is sent on dashboard.load
```
data = {"searchTypeCounts":{},"dashboard":{"autoRun":false,"hideAppBar":false,"hideChrome":false,"hideEdit":false,"hideFilters":false,"hideSplunkBar":false,"hideTitle":false,"isScheduled":false,"isVisible":true,"numCustomCss":0,"numCustomJs":1,"refresh":0,"submitButton":false,"theme":"light","hideExport":false,"version":"1.1"},"elementTypeCounts":{"html":1},"formInputTypeCounts":{},"layoutType":"row-column-layout","numElements":1,"numFormInputs":0,"numSearches":0,"numPanels":1,"numPrebuiltPanels":0,"dependencies":{"webpackDependencies":["splunkjs/mvc/searchmanager","splunkjs/mvc/chartview","splunkjs/mvc/eventsviewerview"],"searchHeadDependencies":[]},"app":"custom_app","page":"custom_dashboard"}
```
We’ve added the `dashboard.version`, `webpackDependencies`, and `searchheadDependencies`.

## How the dependencies are sent
`ViewModeController.js` calls `DashboardMetrics.sendDashboardMetrics()` which sends the telemetry.
`DashboardMetrics.sendDashboardMetrics` calls
1. `requirejs.getInternalDependencies()` to get dependencies
2. `DashboardMetrics.getDashboardAttrs()` to get the dashboard version

## Where the dependencies are gathered in shim/requirejs
`window.require([custom_js_dependencies])` calls `requirejs.shimmedRequirejsRequire`, which calls `requirejs.exposeModules(custom_js_dependencies, false, true)` to get the dependencies

To find dependencies `requirejs` uses 3 main imports:
1. `Output_web.json` (aka the allow-list)
2. `coreAlias.config.js`
3. `profiles/alias.json`. This is a partial copy of `profiles/shared.js`. [SPL to refactor profiles/shared](https://jira.splunk.com/browse/SPL-201472)

`coreAlias` and `alias.json` contain mappings of shimmed dependencies: given the dependency, we can find which file it is mapped to.

`requirejs.exposedModules` filters dependencies:
1. Given a dependency, find its shim
2. If shim not found in `coreAlias`, look for `alias.json`
3. If found a shim keep the shim
4. If the dependency is in `output_web.json`, keep the dependency
5. Storage:
    a. If a dependency/shim is already loaded via webpack store it in `webpackDependencies`
    b. Otherwise store it in `searchheadDependencies`
5. If the dependency is not shimmed and not in `output_web.json`, ignore it

## Allow-list generation
`Output_web.json` is generated in the `web` directory by running `source $SPLUNK_SOURCE/get_dependencies.sh`
This list contains all the files under `$SPLUNK_HOME/share/splunk/search_mrsparkle/exposed/js`

To generate the same file in the `web_v2` folder, run `source $SPLUNK_SOURCE/get_dependencies.sh web_v2`

This is currently a manual process, do this at least once per release towards the end of release. [SPL to automate the allow-list process](https://jira.splunk.com/browse/SPL-201473)


