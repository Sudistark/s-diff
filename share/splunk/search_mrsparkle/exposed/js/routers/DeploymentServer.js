define(
    [
        'underscore',
        'jquery',
        'routers/Base',
        'models/services/server/ServerInfo',
        'util/splunkd_utils',
        'views/shared/Paywall',
        'views/deploymentserver/DeploymentServer',
        'views/deploymentserver/shared/ErrorMessage',
        'views/deploymentserver/disabled/Disabled',
        'models/services/AppLocal',
        'models/services/deploymentserver/Enable',
        'models/services/deploymentserver/Reload',
        'collections/services/deploymentserver/DeploymentServerClients',
        'collections/services/deploymentserver/DeploymentServerClasses',
        'collections/services/deploymentserver/DeploymentServer',
        'collections/services/deploymentserver/DeploymentApplications',
        'collections/services/deploymentserver/ConfigViolations',
        'collections/services/deploymentserver/RecentDownloads',
        'models/classicurl',
        'bootstrap.tab'
    ],
    function(
        _,
        $,
        BaseRouter,
        ServerInfo,
        splunkd_utils,
        Paywall,
        DeploymentServerView,
        ErrorMessageView,
        DisabledView,
        AppLocalModel,
        Enable,
        Reload,
        DeploymentServerClientsCollection,
        DeploymentServerClassesCollection,
        DeploymentServerCollection,
        DeploymentAppsCollection,
        ConfigViolationsCollection,
        RecentDownloadsCollection,
        classicurlModel,
        bootstrapTab
    ){
        return BaseRouter.extend({
            initialize: function() {
                BaseRouter.prototype.initialize.apply(this, arguments);
                this.setPageTitle(_('Forwarder Management').t());
                //Models
                this.appLocalModel = new AppLocalModel();

                this.fetchUser = true;
                this.enableAppBar = false;
            },
            page: function(locale, app, page) {
                BaseRouter.prototype.page.apply(this, arguments);
                var serverClientsCollection = new DeploymentServerClientsCollection();
                var clientsWithUnknownStatus = new DeploymentServerClientsCollection();
                var serverClassesCollection = new DeploymentServerClassesCollection();
                var deploymentAppsCollection = new DeploymentAppsCollection();
                var deploymentServerCollection = new DeploymentServerCollection();
                var configViolations = new ConfigViolationsCollection();
                var phonedHomeClientsCollection = new DeploymentServerClientsCollection();
                var deploymentErrorClientsCollection = new DeploymentServerClientsCollection();
                var recentDownloadClientsCollection = new RecentDownloadsCollection();
                // Get clients with invalid configs
                this.deferreds.configViolations = configViolations.fetch();
                // Get number of clients which phoned home in the last 24 hours
                var numSecondsIn24Hours = 24 * 60 * 60;
                if( !Date.now) {
                    Date.now = function() {return new Date().getTime();};
                }
                var epoch_time = parseInt(Date.now()/1000, 10) - numSecondsIn24Hours;
                this.deferreds.phonedHomeClients = phonedHomeClientsCollection.fetch({
                    data:{
                        minLatestPhonehomeTime: epoch_time,
                        count: 1
                    }
                });
                // Get number of clients with deployment errors
                this.deferreds.deploymentErrorClients = deploymentErrorClientsCollection.fetch({
                    data:{
                        hasDeploymentError: true,
                        count: 1
                    }
                });
                // Get number of clients with recent downloads in last one hour
                var numSecondsInOneHour = 3600;
                this.deferreds.recentDownloadClients = recentDownloadClientsCollection.fetch({
                    data:{
                        count: 1,
                        maxAgeSecs: numSecondsInOneHour
                    }
                });
                // Get number of clients with unknown status
                this.deferreds.clientsWithUnknownStatus = clientsWithUnknownStatus.fetch({
                    data:{
                        count: 1,
                        offset: 0,
                        action:'Download',
                        brief: true
                    }
                });
                // Get all the other client details
                // Collecting it after above so that we get the maximum ones which are connected
                this.deferreds.clients = serverClientsCollection.fetch({
                    data:{
                        count: 10,
                        offset: 0
                    }
                });
                this.deferreds.serverclasses = serverClassesCollection.fetch({data:{count: 10, offset: 0}});
                this.deferreds.apps = deploymentAppsCollection.fetch({data:{count: 10, offset: 0}});
                this.deferreds.classicurlModel = classicurlModel.fetch();
                this.deferreds.config = deploymentServerCollection.fetch({data:{app:'system', owner:'nobody'},
                   success: function(model, response) {
                       if (response.entry[0].content.disabled) {
                            this.disabledView = new DisabledView({
                                model: {
                                    enable: new Enable(),
                                    reload: new Reload(),
                                    application: this.model.application,
                                },
                            });
                            this.deferreds.pageViewRendered.done(function() {
                                this.pageView.$('.main-section-body').append(this.disabledView.render().el);
                            }.bind(this));
                       }
                   }.bind(this),
                   error: function(model, response) {
                        //There was an error loading the UI.  Two possibilities: User has a free license or there is a syntax error in his serverclass.conf
                        if (response.status == 402) {
                            this.payWallView = new Paywall({model:this.model, title: "Forwarder management"});

                            this.deferreds.pageViewRendered.done(function() {
                                this.pageView.$('.main-section-body').append(this.payWallView.render().el);
                            }.bind(this));
                        } else {   // Case 2: User has a syntax error in serverclass.conf
                            this.errorView = new ErrorMessageView();
                            this.deferreds.pageViewRendered.done(function() {
                                this.pageView.$('.main-section-body').append(this.errorView.render().el);
                            }.bind(this));
                        }
                  }.bind(this)
              });

                $.when(
                    this.deferreds.clients,
                    this.deferreds.clientsWithUnknownStatus,
                    this.deferreds.serverclasses,
                    this.deferreds.apps,
                    this.deferreds.config,
                    this.deferreds.pageViewRendered,
                    this.deferreds.classicurlModel,
                    this.deferreds.configViolations,
                    this.deferreds.phonedHomeClients,
                    this.deferreds.deploymentErrorClients,
                    this.deferreds.recentDownloadClients
                ).then(function(){
                    this.deploymentServerView = new DeploymentServerView({
                            collection: {
                                serverClients: serverClientsCollection,
                                serverClasses: serverClassesCollection,
                                deploymentApps: deploymentAppsCollection,
                                deploymentServers: deploymentServerCollection,
                                clientsWithUnknownStatus: clientsWithUnknownStatus,
                                phonedHomeClients: phonedHomeClientsCollection,
                                deploymentErrorClients: deploymentErrorClientsCollection,
                                recentDownloadClients: recentDownloadClientsCollection
                            },
                            model: {classicUrlModel: classicurlModel},
                            isReadOnly: configViolations.length > 0,
                            application: this.model.application
                        });
                        this.pageView.$('.main-section-body').append(this.deploymentServerView.render().el);
                }.bind(this));

                this.deferreds.pageViewRendered.done(function() {
                    $('.preload').replaceWith(this.pageView.el);
                }.bind(this));
            }
        });
    }
);
