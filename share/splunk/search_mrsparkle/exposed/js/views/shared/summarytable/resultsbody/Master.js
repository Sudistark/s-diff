define(
    [
        'jquery',
        'underscore',
        'module',
        'views/shared/summarytable/resultsbody/column/Master',
        'views/Base'
    ],
    function(
        $,
        _,
        module,
        ColumnView,
        BaseView
    ) {
        return BaseView.extend({
            moduleId: module.id,
            className: 'column-master',

            initialize: function(options) {
                BaseView.prototype.initialize.apply(this, arguments);
            },

            startListening: function(options) {
                this.listenTo(this.model.state, 'clearSelection', this.clearSelection);
                this.listenTo(this.model.state, 'columnInteraction', this.toggleClassForColumn);
                this.listenTo(this.model.state, 'tableInteraction', this.toggleClassForTable);
                this.listenTo(this.model.state, 'cutSelection', this.handleCutSelection);
                this.listenTo(this.model.state, 'clearCutSelection', this.handleClearCutSelection);
            },

            handleCutSelection: function() {
                this.$('div.summary-table-column.column-selected').addClass('column-cut');
            },

            handleClearCutSelection: function(shouldAddSelection) {
                if (shouldAddSelection) {
                    this.clearSelection();
                    this.$('div.summary-table-column.column-cut').addClass('column-selected');
                }
                this.$('div.summary-table-column.column-cut').removeClass('column-cut');
            },

            getColumnView: function(options) {
                return new ColumnView({
                    model: {
                        column: options && options.column ? options.column : this.model.column,
                        dataset: this.model.dataset,
                        resultJsonRows: this.model.resultJsonRows,
                        summary: this.model.summary,
                        timeline: this.model.timeline,
                        state: this.model.state,
                        dataSummaryJob: this.model.dataSummaryJob
                    },
                    colIndex: this.options.colIndex,
                    editingMode: this.options.editingMode
                });
            },

            // Interaction handlers

            clearSelection: function() {
                this.$('div.selected, div.column-selected, div.text-selected').removeClass('selected column-selected text-selected');

                // This will get rid of all the spans that are controlling the text selections
                _.each(this.$('span.selection'), function(el) {
                    $(el).remove();
                }, this);
            },

            toggleClassForColumn: function(index, className, add) {
                var $column = this.$('div[data-col-index=' + index + ']');

                if (add) {
                    $column.addClass(className);
                } else {
                    $column.removeClass(className);
                }
            },

            toggleClassForTable: function(className, add) {
                var $allCols = this.$('div[data-col-index]');

                if (add) {
                    $allCols.addClass(className);
                } else {
                    $allCols.removeClass(className);
                }
            },

            enableSelection: function(enable) {
                this.children.column && this.children.column.enableSelection(enable);
            },

            removeOldColumns: function() {
                this.children.column && this.children.column.deactivate({ deep: true });
                this.children.column && this.children.column.debouncedRemove({ detach: true });
            },

            render: function(options) {
                // Only create column views from scratch if this is the first time rendering, or column order has changed.
                if (!this.$el.html() || this.options.columnsAreDifferent || this.options.syncComplete) {
                    this.removeOldColumns();

                    this.children.column = this.getColumnView(options);
                    this.children.column.activate({deep: true}).render().appendTo(this.$el);
                } else {
                // Otherwise, column views are already activated and in DOM. Just re-render their contents.
                    this.children.column.render();
                }

                return this;
            }
        });
    }
);
