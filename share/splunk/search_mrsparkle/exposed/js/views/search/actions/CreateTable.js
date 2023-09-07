define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'uri/route',
        'splunk.util',
    ],
    function($, _, module, Base, route, SplunkUtil) {
        return Base.extend({
            tagName: 'a',
            attributes: {
                "href": "#"
            },
            moduleId: module.id,
            className: 'btn-pill',
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
            },

            startListening: function() {
                this.listenTo(this.model.report.entry.content, 'change', this.render);
                this.listenTo(this.model.searchJob, 'prepared', this.render);
            },

            events: {
                'click': function(e) {
                    if ($(e.currentTarget).hasClass('disabled')) {
                        e.preventDefault();
                    } else {
                        SplunkUtil.trackEvent({
                            type: 'tableUI.interact',
                            data: {
                                action: 'create_table_view_with_search',
                                location: 'search page',
                            },
                        });
                    }
                }
            },

            render: function() {
                var isReportSearch = this.model.searchJob.isReportSearch(),
                    openTableRoute = route.table(
                        this.model.application.get('root'),
                        this.model.application.get('locale'),
                        this.model.application.get('app'),
                        {
                            data: {
                                bs: this.model.report.entry.content.get('search'),
                                'dataset.search.fields': isReportSearch ? '': this.model.report.entry.content.get('display.events.fields')
                            }
                        }
                    );
                this.$el.html(_('Create Table View').t());
                if (this.model.tableAST && this.model.tableAST.isTableable()) {
                    this.$el.attr('href', openTableRoute);
                } else {
                    this.$el.addClass('disabled');
                }
                return this;
            }
        });
    }
);
