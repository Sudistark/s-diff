define(function (require, exports, module) {
    var mvc = require('./mvc'),
        BaseSplunkView = require("./basesplunkview"),
        GlobalNav = require('views/shared/splunkbar/Master'),
        AppNav = require('views/shared/appbar/Master'),
        GlobalBannerReactAdapter = require('views/shared/global_banner/ReactAdapterMaster'),
        SideNav = require('views/shared/litebar/Master'),
        sharedModels = require('./sharedmodels'),
        splunkUtils = require('splunk.util'),
        ConfigModel = require('models/config'),
        route = require('uri/route');

    /**
     * @constructor
     * @memberOf splunkjs.mvc
     * @name HeaderView
     * @description The **Header** view displays the Splunk header.
     * @extends splunkjs.mvc.BaseSplunkView
     *
     * @param {Object} options
     * @param {String} options.id - The unique ID for this control.
     * @param {Boolean} [options.appbar=true] Indicates whether to display the app bar.
     * @param {Object} [options.settings] - The properties of the view.
     *
     * @example
     * require([
     *     "splunkjs/mvc/headerview",
     *     "splunkjs/mvc/simplexml/ready!"
     * ], function(HeaderView) {
     *
     *     // Instantiate components
     *     new HeaderView({
     *         id: "example-header",
     *         el: $("#myheaderview")
     *     }).render();
     *
     * });
     */
    var HeaderView = BaseSplunkView.extend(/** @lends splunkjs.mvc.HeaderView.prototype */{
        moduleId: module.id,

        className: 'splunk-header',

        options: {
            appbar: true,
            splunkbar: true,
            fromApp: false,

            /* DEPRECATED */
            useSessionStorageCache: false,

            /* DEPRECATED - ignored */
            acceleratedAppNav: false
        },

        initialize: function() {
            this.configure();
            this.model = this.model || {};
            this.model.application = sharedModels.get("app");
            this.model.user = sharedModels.get("user");
            this.model.appLocal = sharedModels.get("appLocal");
            this.model.serverInfo = sharedModels.get("serverInfo");
            this.model.userPref = sharedModels.get("userPref");
            this.model.globalBanner = sharedModels.get("globalBanner");

            this.collection = this.collection || {};
            this.collection.appLocals = sharedModels.get("appLocals");
            this.collection.tours = sharedModels.get("tours");

            this.deferreds = this.deferreds || {};
            this.deferreds.tours = new Promise(function (resolve, reject) {
                this.model.serverInfo.dfd.then(function() {
                    this.useSideNav = this.settings.get('litebar') || this.model.serverInfo.isLite();

                    if (this.useSideNav) {
                        this.collection.tours.dfd.done(function() {
                            this.sideNav = SideNav.create({
                                showAppsList: this.options.showAppsList,
                                hideActivityMenu: this.options.hideActivityMenu,
                                model: {
                                    application: this.model.application,
                                    appLocal: this.model.appLocal,
                                    user: this.model.user,
                                    serverInfo: this.model.serverInfo,
                                    config: ConfigModel,
                                    appNav: this.model.appNav,
                                    userPref: this.model.userPref
                                },
                                collection: {
                                    apps: this.collection.appLocals,
                                    tours: this.collection.tours
                                }
                            });
                            resolve();
                        }.bind(this));
                    }
                }.bind(this));
            }.bind(this));

            // Necessary to expose promise to test functionality after promise is resolved.
            this.sharedPromise = Promise.all([this.model.serverInfo.dfd, this.model.globalBanner.dfd]);
        },

        renderSplunkBar: function() {
            if (this.settings.get('splunkbar')) {
                if (!this.globalNav) {
                    this.globalNav = GlobalNav.create({
                        showAppsList: this.settings.get('showAppsList') !== false,
                        fromApp: this.settings.get('fromApp'),
                        model: {
                            application: this.model.application,
                            appLocal: this.model.appLocal,
                            user: this.model.user,
                            serverInfo: this.model.serverInfo,
                            config: ConfigModel,
                            userPref: this.model.userPref
                        },
                        collection: {
                            apps: this.collection.appLocals
                        }
                    });
                }
                this.globalNav.render().appendTo(this.$el);
            } else {
                if (this.globalNav) {
                    this.globalNav.remove();
                    this.globalNav = null;
                }
            }
        },
        renderAppBar: function() {
            if (this.settings.get('appbar')) {
                if (!this.appNav) {
                    this.appNav = AppNav.create({
                        model: {
                            application: this.model.application,
                            app: this.model.appLocal,
                            user: this.model.user,
                            serverInfo: this.model.serverInfo,
                            appNav: this.model.appNav
                        },
                        useSessionStorageCache: this.settings.get('useSessionStorageCache'),
                        autoRender: false
                    });
                }
                this.appNav.render().appendTo(this.$el);
            } else {
                if (this.appNav) {
                    this.appNav.remove();
                    this.appNav = null;
                }
            }
        },
        renderGlobalBanner: function() {
            if (!this.globalBanner) {
                this.globalBanner = new GlobalBannerReactAdapter({
                    model: {
                        globalBanner: this.model.globalBanner
                    }
                });
            }
            this.globalBanner.render().appendTo(this.$el);
        },
        /**
         * Draws the view to the screen. Called only when you create the view manually.
         */
        render: function() {
            this.stopListening(this.settings, 'change:splunkbar');
            this.stopListening(this.settings, 'change:appbar');

            this.sharedPromise.then(function() {
                if (this.useSideNav) {
                    this.deferreds.tours.then(function() {
                        this.$el.empty();
                        this.$el.append(this.sideNav.el);
                    }.bind(this));
                } else {
                    this.$el.empty();
                    if (this.options.fromApp && this.model.globalBanner.globalBannerVisible()) {
                        this.renderGlobalBanner();
                    }
                    this.renderSplunkBar();
                    this.renderAppBar();
                    this.listenTo(this.settings, 'change:appbar', function() {
                        this.renderAppBar();
                    });
                    this.listenTo(this.settings, 'change:splunkbar', function(){
                        this.renderSplunkBar();
                    });
                }
            }.bind(this));
            return this;
        }
    });

    return HeaderView;
});
