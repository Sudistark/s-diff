define(
    [
        'underscore',
        'module',
        'views/Base',
        'views/shared/jobstatus/buttons/ExportResultsDialog',
        'splunk.util',
        'bootstrap.tooltip'
    ],
    function(_, module, Base, ExportDialog, splunkUtils) {
        return Base.extend({
            moduleId: module.id,
            className: 'export btn-pill btn-square',
            tagName: 'a',
            attributes: {
                "href": "#"
            },
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
                this.$el.html('<i class="icon-export"></i><span class="hide-text">' + _("Export").t() + '</span>');
                this.$el.tooltip({animation:false, title:_('Export').t(), container: this.$el});
                this.activate();
            },
            startListening: function() {
                this.listenTo(this.model.searchJob.entry.content, 'change:dispatchState', _.debounce(this.enableDisable, 0));
            },
            events: {
                'click': function(e) {
                    if(!this.$el.hasClass('disabled')) {
                        this.children.exportDialog = new ExportDialog({
                            model: {
                                searchJob: this.model.searchJob,
                                application: this.model.application,
                                report: this.model.report,
                                reportPristine: this.model.reportPristine
                            },
                            verifyJobExistsExport: this.options.verifyJobExistsExport,
                            allowRawEventsExport: this.options.allowRawEventsExport,
                            fields: this.options.fields,
                            onHiddenRemove: true
                        });

                        document.body.appendChild(this.children.exportDialog.render().el);
                        this.children.exportDialog.show();
                    }
                    splunkUtils.trackPageInteraction(this.model.application.get('app'), 'Click Export Job Link');
                    e.preventDefault();
                }
            },
            enableDisable: function() {
                if (!this.model.searchJob.isDone()) {
                    this.$el.tooltip('hide');
                    this.$el.data('tooltip', false);
                    this.$el.tooltip({animation:false, title:_('Export - You can only export results for completed jobs.').t(), container: this.$el});
                    this.$el.addClass('disabled');
                } else {
                    this.$el.tooltip('hide');
                    this.$el.data('tooltip', false);
                    this.$el.tooltip({animation:false, title:_('Export').t(), container: this.$el});
                    this.$el.removeClass('disabled');
                }
            },
            render: function() {
                this.enableDisable();
                return this;
            }
        });
    }
);
