define(
    [
        'underscore',
        'jquery',
        'module',
        'models/datasets/Column',
        'views/Base',
        'views/shared/datasettable/shared/TableHeader'
    ],
    function(
        _,
        $,
        module,
        ColumnModel,
        BaseView,
        TableHeaderView
    ) {
        return TableHeaderView.extend({
            moduleId: module.id,
            shouldFastRouteOnColumnDrop: true, //Whole table should not re-render when drag and drop of column is complete

            initialize: function(options) {
                TableHeaderView.prototype.initialize.apply(this, arguments);
            },

            events: {
                'mouseenter .col-header:not(".disabled")': function(e) {
                    this.model.state.trigger('columnInteraction', $(e.currentTarget).data('col-index'), 'hover', true);
                },
                'mouseleave .col-header:not(".disabled")': function(e) {
                    this.model.state.trigger('columnInteraction', $(e.currentTarget).data('col-index'), 'hover', false);
                },
                'click .col-header:not(".disabled")': function(e) {
                    if (!$(e.target).hasClass('resize')) {
                        this.handleClick(e);
                    }
                },
                'dblclick .col-header:not(".disabled")': function(e) {
                    var $target = $(e.target),
                        isCtrlClick = e.metaKey || e.ctrlKey || false,
                        isShiftClick = e.shiftKey || false;
                    if ($target && !$target.is('span.resize') && !$target.is('i.field-type')
                            && !isCtrlClick && !isShiftClick) {
                        this.handleClick(e);
                        this.handleDirectRename(e);
                    }
                }
            },

            startListening: function(options) {
                TableHeaderView.prototype.startListening.apply(this, arguments);
                this.listenTo(this.model.state, 'cutSelection', this.handleCutSelection);
                this.listenTo(this.model.state, 'clearCutSelection', this.handleClearCutSelection);
                this.listenTo(this.model.state, 'columnInteraction', this.toggleClassForColumn);
                this.listenTo(this.model.state, 'columnSelection', this.handleColumnSelect);
                this.listenTo(this.model.state, 'destroyContextualMenus', function() {
                    this.children.typeMenu && this.children.typeMenu.deactivate({ deep: true }).remove();
                    delete this.children.typeMenu;
                });
            },

            toggleClassForColumn: function(index, className, add) {
                var $column = this.$('div[data-col-index=' + index + ']');

                if (add) {
                    $column.addClass(className);
                } else {
                    $column.removeClass(className);
                }
            },

            handleTableSelect: function($allColsSelected) {
                $allColsSelected.addClass('column-selected');

                TableHeaderView.prototype.handleTableSelect.apply(this, arguments);
            },

            addSelectedColumn: function($column) {
                var columnIndex = $column.data('col-index');

                $column.addClass('column-selected');
                this.model.state.trigger('columnInteraction', columnIndex, 'column-selected', true);
            },

            removeSelectedColumn: function($column) {
                var columnIndex = $column.data('col-index');

                if ($column.hasClass('column-selected')) {
                    $column.removeClass('column-selected');
                    this.model.state.trigger('columnInteraction', columnIndex, 'column-selected', false);
                }
            },

            handleCutSelection: function() {
                this.$('.col-header.column-selected').addClass('column-cut');
            },

            handleClearCutSelection: function() {
                this.$('.col-header.column-cut').removeClass('column-cut');
            },

            clearSelection: function() {
                this.$('.column-selected').removeClass('column-selected');
            },

            render: function(options) {
                TableHeaderView.prototype.render.apply(this, arguments);

                var currentCommandModel,
                    shouldDisableSelection = true,
                    metrics, colName, $column;

                if (this.model.dataset.isTable() && this.options.editingMode) {
                    currentCommandModel = this.model.dataset.getCurrentCommandModel();
                    shouldDisableSelection = !currentCommandModel.isComplete() || !currentCommandModel.isValid();
                }

                if (!this.$el.html() || this.options.columnsAreDifferent || this.options.syncComplete) {
                    this.$el.html(this.compiledTemplate({
                        ColumnModel: ColumnModel,
                        column: this.model.column,
                        index: this.options.colIndex
                    }));
                }

                this.delegateEvents();

                return this;
            },

            template: '\
                <div class="dataset-table-head">\
                    <% var colName = column.get("name"); %>\
                    <div class="col-header field type-<%- column.get("type") %>" data-col-index="<%- index %>" data-field="<%- colName %>" style="<%- column.get("display.width") ? "width: " + column.get("display.width") + "px; min-width: " + Math.max(column.get("display.width"), 200) + "px;": "" %>">\
                        <i class="icon-<%- ColumnModel.ICONS[column.get("type")] %> field-type" data-type="<%- column.get("type") %>"></i>\
                        <span class="name" title="<%- colName %>"><%- colName %></span>\
                        <div class="coverage" data-field="<%- colName %>">\
                            <div class="bar match"></div>\
                            <div class="bar mismatch"></div>\
                            <div class="bar null-or-empty"></div>\
                            <div class="bar loading"></div>\
                        </div>\
                    </div>\
                </div>\
            '
        });
    }
);
