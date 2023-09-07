define(
    [
        'underscore',
        'jquery',
        'module',
        'models/datasets/Table',
        'models/services/datamodel/DataModel',
        'views/Base',
        'views/shared/datasetcontrols/editmenu/Master',
        'views/shared/datasetcontrols/exploremenu/Master',
        'views/shared/delegates/Popdown'
    ],
    function(
        _,
        $,
        module,
        TableModel,
        DataModel,
        BaseView,
        EditMenu,
        ExploreMenu
    ) {
        return BaseView.extend({
            moduleId: module.id,
            className: 'pull-right',

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                this.tableModelDeferred = $.Deferred();
                if (this.model.dataset.getType() === DataModel.DOCUMENT_TYPES.TABLE) {
                    this.tableModel = new TableModel();
                    this.tableModel.set("id", this.model.dataset.id);
                    this.tableModel.fetch({
                        data: {
                            app: this.model.application.get("app"),
                            owner: this.model.application.get("owner")
                        },
                        success: function(){
                            this.tableModel.entry.content.set('search', this.tableModel.getFullSearch() || '');
                            this.tableModelDeferred.resolve();
                        }.bind(this),
                        error: function(){
                            this.tableModelDeferred.resolve();
                        }.bind(this)
                    });
                } else {
                    this.tableModelDeferred.resolve();
                }

                this.children.editMenu = new EditMenu({
                    model: {
                        application: this.model.application,
                        appLocal: this.model.appLocal,
                        dataset: this.model.dataset,
                        searchJob: this.model.searchJob,
                        serverInfo: this.model.serverInfo,
                        user: this.model.user
                    },
                    collection: {
                        roles: this.collection.roles
                    },
                    deleteRedirect: true,
                    showScheduleLink: true,
                    className: 'btn-combo',
                    buttonClass: 'btn-primary'
                });

                this.children.exploreMenu = new ExploreMenu({
                    model: {
                        dataset: this.model.dataset,
                        application: this.model.application,
                        searchJob: this.model.searchJob,
                        user: this.model.user,
                        appLocal: this.model.appLocal,
                        serverInfo: this.model.serverInfo
                    },
                    collection: {
                        apps: this.collection.apps
                    }
                });
            },

            activate: function(options) {
                if (this.active) {
                    return BaseView.prototype.activate.apply(this, arguments);
                }

                return BaseView.prototype.activate.apply(this, arguments);
            },

            render: function() {
                this.$el.html(this.compiledTemplate({
                    _: _
                }));

                $.when(this.tableModelDeferred).then(function() {
                    this.children.editMenu.model.table = this.tableModel;
                    this.children.editMenu.render().prependTo(this.$('.edit-info-section'));
                }.bind(this));

                this.children.exploreMenu.render().appendTo(this.$el);
                return this;
            },
            template: '\
                <div class="edit-info-section btn-group">\
                </div>\
            '
        });
    });
