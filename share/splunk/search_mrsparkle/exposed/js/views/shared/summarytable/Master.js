define(
    [
        'underscore',
        'jquery',
        'module',
        'models/datasets/commands/Base',
        'collections/datasets/Columns',
        'views/Base',
        'views/shared/delegates/TableDock',
        'views/shared/waitspinner/Master',
        'views/shared/summarytable/SummaryCardsMaster',
        './Master.pcss'
    ],
    function(
        _,
        $,
        module,
        BaseCommand,
        ColumnsCollection,
        BaseView,
        TableDock,
        WaitSpinnerView,
        SummaryCardsMasterView,
        css
    ) {
        return BaseView.extend({
            moduleId: module.id,
            className: 'table-wrapper',

            initialize: function(options) {
                BaseView.prototype.initialize.apply(this, arguments);

                this.collection = this.collection || {};
                this.collection.columns = this.collection.columns || new ColumnsCollection();

                this.children.waitSpinner = new WaitSpinnerView({
                    color: 'green',
                    size: 'medium',
                    frameWidth: 19
                });
                
                this.children.summaryCardsMaster = new SummaryCardsMasterView({
                    model: {
                        dataset: this.model.dataset,
                        resultJsonRows: this.model.resultJsonRows,
                        state: this.model.state,
                        summary: this.model.summary,
                        ast: this.model.ast,
                        timeline: this.model.timeline,
                        dataSummaryJob: this.model.dataSummaryJob
                    },
                    collection: {
                        columns: this.collection.columns
                    },
                    editingMode: this.options.editingMode
                });
            },

            startListening: function(options) {
                this.listenTo(this.model.state, 'clearSelection', function() {
                    this.model.dataset.clearSelections();
                });
                this.listenTo(this.model.state, 'setSelectedColumn', function(colIndex) {
                   this.model.dataset.setSelectedColumn(colIndex);
                });
                this.listenTo(this.model.resultJsonRows, 'sync', this.debouncedRender.bind(this,
                    { action: 'sync', model: 'resultJsonRows'}));
                this.listenTo(this.model.summary, 'sync', this.debouncedRender.bind(this,
                    { action: 'sync', model: 'summary'}));
                this.listenTo(this.model.state, 'change:tableEnabled', function() {
                    var enable = this.model.state.get('tableEnabled');
                    this.enableSelection(enable);
                }, this);
            },

            activate: function(options) {
                if (this.active) {
                    return BaseView.prototype.activate.apply(this, arguments);
                }

                this.children.waitSpinner.stop();
                this.children.waitSpinner.$el.hide();
                this.$el.removeClass('disabled');

                this.updateColumnsCollection();

                this.children.tableDock && this.children.tableDock.update();

                return BaseView.prototype.activate.apply(this, arguments);
            },

            deactivate: function(options) {
                if (!this.active) {
                    return BaseView.prototype.deactivate.apply(this, arguments);
                }

                BaseView.prototype.deactivate.apply(this, arguments);

                this.children.waitSpinner.$el.show();
                !this.children.waitSpinner.active && this.children.waitSpinner.start();
                this.$el.addClass('disabled');

                return this;
            },


            updateColumnsCollection: function() {
                var columnsData = [],
                    lastSafeCommand;

                // We only respect the command indices if told to.
                if (this.model.dataset.isTable() && this.options.respectCommandIndex) {
                    lastSafeCommand = this.model.dataset.getLastSafeCommandForCommandIndex();

                    if (lastSafeCommand) {
                        columnsData = lastSafeCommand.columns.toJSON();
                    }
                } else {
                    columnsData = this.model.dataset.getTypedFields({ withoutUnfixed: true });
                }

                // Record whether the columns changed before resetting columns collection, so that
                // the summary table knows to re-render its columns in render().
                this.columnsAreDifferent = !_.isEqual(columnsData, this.collection.columns.toJSON());

                this.collection.columns.reset(columnsData);
            },

            /*
            Summary endpoint only returns events if there are external (non-underscore) fields in the search.
            If there are only internal fields OR it is a lookup dataset (which has no summary) and there are results from the Results endpoint,
            we still want to show the table (albeit without summary events).
            */
            shouldRenderTable: function() {
                return (this.model.summary.getEventCount() > 0 || this.model.resultJsonRows.hasRows());
            },

            renderBars: function() {
                this.collection.columns.each(function(column) {
                    var colName = column.get("name");
                    var metrics = this.model.resultJsonRows.extractMetrics(column, this.model.summary.extractTopResults(colName));
                    var $column = this.$el.find('.col-header[data-field="' + colName + '"]');
        
                    this.toggleBarVisibility($column, metrics, 'MatchedType', 'match');
                    this.toggleBarVisibility($column, metrics, 'MismatchedType', 'mismatch');
                    this.toggleBarVisibility($column, metrics, 'NullOrEmptyValues', 'null-or-empty');
                    this.toggleBarVisibility($column, metrics, undefined, 'loading');
                }, this);
            },

            $getColHeader: function(colName) {
                return this.$('.col-header[data-field="' + colName + '"]');
            },
    
    
            enableSelection: function(enable) {
                if (enable) {
                    this.$el.find('.col-header').removeClass('disabled');
                    this.$el.find('.list-summary').removeClass('disabled');
                    this.$el.find('.top-results-cell').removeClass('disabled');
                    this.$el.find('.summary-table-column').removeClass('disabled');
                } else {
                    this.$el.find('.col-header').addClass('disabled');
                    this.$el.find('.list-summary').addClass('disabled');
                    this.$el.find('.top-results-cell').addClass('disabled');
                    this.$el.find('.summary-table-column').addClass('disabled');
                }
            },

            clearSelection: function() {
                this.$el.find('.column-selected').removeClass('column-selected');
                this.$el.find('div.selected, div.column-selected, div.text-selected')
                    .removeClass('selected column-selected text-selected');
                // This will get rid of all the spans that are controlling the text selections
                var i,
                    spans = this.$el.find('span.selection');
                for (i = 0; i < spans.length; i += 1) {
                    $(spans[i]).remove();
                }
            },

            setSelection: function() {
                var selectedColumns = this.model.dataset.selectedColumns,
                    selectionType = this.model.dataset.entry.content.get('dataset.display.selectionType'),
                    selectedText = this.model.dataset.entry.content.get('dataset.display.selectedText'),
                    currentCommandIndex = this.model.dataset.getCurrentCommandIdx(),
                    currentCommand = this.model.dataset.commands.at(currentCommandIndex),
                    $target,
                    triggerArgs,
                    selectedColumnInColumnsCollection;
        
                if (selectionType === 'column') {
                    selectedColumns.each(function(selectedColumn) {
                        selectedColumnInColumnsCollection = currentCommand.columns.get(selectedColumn.id);
                
                        // It's possible that the selected column doesn't exist in the table anymore
                        if (selectedColumnInColumnsCollection) {
                            $target = this.$getColHeader(selectedColumnInColumnsCollection.get('name'));
                            this.addSelectedColumn($target);
                            // $target.attr("draggable", true);
                        }
                    }.bind(this));
                } else if ((selectionType === 'cell') || (selectionType === 'text')) {
                    // If selected value is present in the summary top results, then tell TopResults view to
                    // render it as selected via the state model
                    var selectedValueString = this.model.dataset.entry.content.get('dataset.display.selectedColumnValue'),
                        selectedColumnId = selectedColumns && selectedColumns.length > 0 && selectedColumns.first().id,
                        selectedColumn = this.collection.columns.get(selectedColumnId),
                        selectedColumnTopValues = selectedColumn &&
                            this.model.summary.extractTopResults(selectedColumn.get('name')),
                        selectedValue = _.where(selectedColumnTopValues, { name: selectedValueString }) || [];
            
                    if (selectedValue.length === 1) {
                        triggerArgs = {
                            columnName: selectedColumn.get('name'),
                            selectedValue: selectedValueString
                        };
                        if (selectionType === 'text') {
                            // Is Text selection
                            _.extend(triggerArgs, {
                                startIndex: this.model.dataset.entry.content.get('dataset.display.selectedStart'),
                                endIndex: this.model.dataset.entry.content.get('dataset.display.selectedEnd'),
                                selectedText: selectedText
                            });
                        }
                
                        this.model.state.trigger('setValueSelection', triggerArgs);
                    } else {
                        // selected value is not present in top results. just select the column instead
                        $target = this.$getColHeader(selectedColumn.get('name'));
                        this.addSelectedColumn($target);
                    }
                }
            },

            clearHighlight: function() {
                this.$el.find('.column-highlighted').removeClass('column-highlighted');
            },

            highlightFields: function() {
                var currentModel = this.model.dataset.getCurrentCommandModel(),
                    currentType = currentModel.get('type'),
                    modifiedFields = this.model.ast.getModifiedFieldsNameList() || [];
                if (!currentModel.isComplete() || currentType === BaseCommand.INITIAL_DATA) {
                    return;
                }
                if (modifiedFields.length) {
                    this.handleColumnHighlight(modifiedFields);
                }
            },

            handleColumnHighlight: function(fields) {
                var i, $field;
                for (i = 0; i < fields.length; i += 1) {
                    $field = this.$el.find('.col-header[data-field="' + fields[i] + '"]');
                    $field.addClass('column-highlighted');
                    this.model.state.trigger('columnInteraction', $field.data('col-index'), 'column-highlighted', true);
                }
            },

            addSelectedColumn: function($column) {
                $column.addClass('column-selected');
                this.model.state.trigger('columnInteraction', $column.data('col-index'), 'column-selected', true);
            },

            toggleBarVisibility: function($column, metrics, metricName, barClass) {
                var $bar = $column.find('.' + barClass),
                    metric = _.findWhere(metrics, { key: metricName }),
                    showMetric, barWidth;
        
                if (metrics.length) {
                    if (barClass === 'loading') {
                        this.toggle$BarVisibility($bar, false);
                    } else {
                        showMetric = metric && !metric.isZero;
                        barWidth = metric && metric.value;
                        this.toggle$BarVisibility($bar, showMetric, barWidth);
                    }
                } else if (barClass === 'loading') {
                    this.toggle$BarVisibility($bar, true, '0');
                } else {
                    this.toggle$BarVisibility($bar, false);
                }
            },

            toggle$BarVisibility: function($bar, showMetric, barWidth) {
                if (showMetric) {
                    $bar.show();
                    $bar.css('flex', '1 1 ' + barWidth +'%');
                    // If any bar is shown, hide the empty bar
                    this.$el.find('.bar.empty').hide();
                } else {
                    $bar.hide();
                }
            },

            render: function(options) {
                var renderOptions = {
                    columnsAreDifferent: this.columnsAreDifferent,
                    syncComplete: options && options.action === 'sync',
                    model: options && options.model
                    },
                    shouldDisableSelection = true,
                    currentCommandModel;

                if (this.shouldRenderTable()) {
                    if (!this.$el.html()) {
                        this.$el.html(this.compiledTemplate({}));
                    }
                    
                    this.children.waitSpinner.render().prependTo(this.$el).$el.hide();
                    
                    this.$el.removeClass('summary-table-no-results');
                    
                    if (!this.$('.summary-table-column').length) {
                        // First render where results are present
                        this.children.summaryCardsMaster.remove();
                        this.children.summaryCardsMaster.render(renderOptions).appendTo(this.$('.table-summary'));
                        this.renderBars();
                    } else {
                        // Every other render where results are present
                        renderOptions.shouldUpdate = true;
                        this.children.summaryCardsMaster.remove();
                        this.children.summaryCardsMaster.render(renderOptions).appendTo(this.$('.table-summary'));
                        // Must update coverage bars' appearance every time new results come in, as the CSS is not copied over on tabledock's update
                        this.renderBars();
                    }
                    // Reset flag
                    this.columnsAreDifferent = false;
                    
                    
                    // Reset selection and highlight manually because template does not get fully cleared out every render.
                    this.clearSelection();
                    this.clearHighlight();
                    
                    if (this.model.dataset.isTable() && this.options.editingMode) {
                        currentCommandModel = this.model.dataset.getCurrentCommandModel();
                        shouldDisableSelection = !currentCommandModel.isComplete() || !currentCommandModel.isValid();
                    
                        this.setSelection();
                        this.highlightFields();
                    }
                    this.enableSelection(!shouldDisableSelection);

                } else {
                    this.$el.html(this.compiledTemplate({}));
                    this.$el.addClass('summary-table-no-results');
                }

                // Data summary is pretty good about not rendering itself repeatedly if it doesn't need to.
                // That means that cut selections can linger for longer than they should. Remove here.
                this.model.state.trigger('clearCutSelection');

                return this;
            },

            template: '\
                <div class="scroll-table-wrapper">\
                    <div class="table table-summary">\
                    </div>\
                </div>\
            '
        });
    }
);
