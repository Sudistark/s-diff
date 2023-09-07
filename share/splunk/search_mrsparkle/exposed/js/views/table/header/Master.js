define(
    [
        'underscore',
        'module',
        'models/datasets/Table',
        'models/datasets/commands/InitialData',
        'views/Base',
        'views/table/header/TableName',
        'views/table/header/Save',
        './Master.pcss'
    ],
    function(
        _,
        module,
        TableModel,
        InitialDataModel,
        BaseView,
        TableNameView,
        SaveView,
        css
    ) {
        return BaseView.extend({
            moduleId: module.id,

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                this.children.tableName = new TableNameView({
                    model: {
                        table: this.model.table
                    }
                });

                this.children.saveDataset = new SaveView({
                    model: {
                        application: this.model.application,
                        searchPointJob: this.model.searchPointJob,
                        currentPointJob: this.model.currentPointJob,
                        table: this.model.table,
                        tablePristine: this.model.tablePristine,
                        user: this.model.user,
                        serverInfo: this.model.serverInfo
                    },
                    collection: {
                        roles: this.collection.roles
                    }
                });
            },

            activate: function(options) {
                var clonedOptions = _.extend({}, (options || {}));
                delete clonedOptions.deep;

                if (this.active) {
                    return BaseView.prototype.activate.call(this, clonedOptions);
                }

                this.children.tableName.activate({ deep: true });
                this.manageStateOfChildren();
                return BaseView.prototype.activate.call(this, clonedOptions);
            },

            startListening: function() {
                this.listenTo(this.model.state, 'change:initialDataState', this.manageStateOfChildren);
                this.listenTo(this.model.table.entry.content, 'change:dataset.display.mode', this.manageStateOfChildren);
            },

            manageStateOfChildren: function() {
                if (this.model.state.get('initialDataState') === InitialDataModel.STATES.EDITING) {
                    this.children.saveDataset.deactivate({ deep: true }).$el.hide();
                    return;
                }

                this.children.saveDataset.activate({ deep: true }).$el.css('display', '');
            },

            render: function() {
                if (!this.el.innerHTML) {
                    this.$el.html(this.compiledTemplate());

                    this.children.tableName.activate({ deep: true }).render().prependTo(this.$el);
                    this.children.saveDataset.render().appendTo(this.$('.btn-container'));
                }
                this.manageStateOfChildren();

                return this;
            },

            template: '<div class="btn-container"></div>'
        });
    }
);
