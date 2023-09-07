define(
    [
        'underscore',
        'jquery',
        'module',
        'views/Base',
        'views/datasets/results/Master',
        'views/shared/datasetcontrols/createmenu/Master',
        'uri/route',
        'splunk.util',
        './Master.pcss'
    ],
    function(
        _,
        $,
        module,
        BaseView,
        ResultsView,
        CreateMenu,
        route,
        splunkUtils,
        css
    ) {
        return BaseView.extend({
            moduleId: module.id,

            /**
             * @param {Object} options {
             *      model: {
             *          state: <Backbone.Model>
             *          application: <models.Application>,
             *          uiPrefs: <models.services.admin.UIPrefs>
             *          appLocal: <models.services.AppLocal>
             *          user: <models.services.authentication.User>
             *          userPref: <models.services.data.UserPref>
             *          serverInfo: <models.services.server.ServerInfo>
             *          rawSearch: <Backbone.Model>
             *      }
             *      collection: {
             *          datasets: <collections.Datasets>,
             *          roles: <collections.services.authorization.Roles>,
             *          apps: <collections.services.AppLocals>
             *      }
             * }
             */
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                this.children.results = new ResultsView({
                    model: {
                        state: this.model.state,
                        application: this.model.application,
                        uiPrefs: this.model.uiPrefs,
                        userPref: this.model.userPref,
                        user: this.model.user,
                        appLocal: this.model.appLocal,
                        serverInfo: this.model.serverInfo,
                        rawSearch: this.model.rawSearch
                    },
                    collection: {
                        datasets: this.collection.datasets,
                        roles: this.collection.roles,
                        apps: this.collection.apps
                    }
                });

                this.children.createMenu = new CreateMenu({
                    model: {
                        application: this.model.application,
                        user: this.model.user,
                        appLocal: this.model.appLocal
                    },
                    collection: {
                        apps: this.collection.apps
                    }
                });
            },

            render: function() {
                var helpLink = route.docHelp(
                        this.model.application.get('root'),
                        this.model.application.get('locale'),
                        'learnmore.datasets.listing'
                    );

                if (!this.$el.html()) {
                    this.$el.html(this.compiledTemplate({
                        _: _,
                        helpLink: helpLink
                    }));
                    this.children.results.render().appendTo(this.$el);
                    this.children.createMenu.render().appendTo(this.$('.add-table-controls'));
                }

                return this;
            },

            template: '\
                <div class="section-padded section-header">\
                    <div class="add-table-controls pull-right"></div>\
                    <h1 class="section-title"><%= _("Datasets").t() %></h1>\
                    <p class="section-description"><%= _("Use the Datasets listing page to view and manage your existing datasets. Click a dataset name to view its contents. Select Explore > Visualize in Pivot to design a visualization-rich report based on the dataset. Select Explore > Investigate in Search to extend a dataset in Search and save it as a new report, alert, or dashboard panel.").t() %></p>\
                    <a class="external datasets-help-link" href="<%- helpLink %>" target="_blank"><span><%- _("Learn more about Datasets.").t() %></span></a>\
                </div>\
            '
        });
    }
);
