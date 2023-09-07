define(
    [
        'underscore',
        'module',
        'views/Base',
        'views/shared/datasetcontrols/details/CollapseContainer',
        'views/dataset/header/TaskBar',
        'views/table/resultscontainer/actionbar/NavTab'
    ],
    function(
        _,
        module,
        BaseView,
        CollapseContainer,
        TaskBar,
        NavTab
    ) {
        return BaseView.extend({
            moduleId: module.id,
            className: 'section-header',

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                this.children.title = new CollapseContainer({
                    model: {
                        dataset: this.model.dataset,
                        application: this.model.application,
                        user: this.model.user
                    },
                    collection: {
                        roles: this.collection.roles
                    }
                });

                if (this.model.dataset.getType() !== 'inputlookup-table') {
                    this.children.navtab = new NavTab({
                        model: {
                            dataset: this.model.dataset
                        },
                        state: this.model.state
                    });
                }

                this.children.taskBar = new TaskBar({
                    model: {
                        application: this.model.application,
                        appLocal: this.model.appLocal,
                        dataset: this.model.dataset,
                        searchJob: this.model.searchJob,
                        serverInfo: this.model.serverInfo,
                        timeRange: this.model.timeRange,
                        user: this.model.user
                    },
                    collection: {
                        apps: this.collection.apps,
                        roles: this.collection.roles
                    }
                });
            },

            startListening: function() {
                this.listenTo(this.model.dataset, 'updateCollection', this.children.title.render);
            },

            render: function() {
                this.children.title.render().appendTo(this.$el);
                if (this.children.navtab && this.model.dataset.isNew()) {
                    this.children.navtab.render().appendTo(this.$el);
                }

                this.children.taskBar.render().appendTo(this.$el);

                return this;
            }
        });
    }
);
