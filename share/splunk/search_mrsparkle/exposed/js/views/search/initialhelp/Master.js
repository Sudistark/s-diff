define(
    [
        'underscore',
        'jquery',
        'module',
        'views/Base',
        'views/search/initialhelp/What',
        'views/search/searchhistory/Master',
        'views/search/searchhistory/SearchHistoryToolTipAdapter',
        'uri/route',
        'splunk.util',
        './tableView/Master'
    ],
    function(_, $, module, Base, What, SearchHistoryView, SearchHistoryToolTipAdapter, route, splunkUtil, TableView) {
        return Base.extend({
            moduleId: module.id,
            className: 'main-section',
            /**
             * @param {Object} options {
             *     model: {
             *         appLocal: <models.services.AppLocal>,
             *         application: <models.Application>
             *         serverInfo: <models.services.server.ServerInfo>,
             *         report: <models.search.Report>,
             *         metaDataResult: <models.services.search.job.Result>,
             *         searchBar: <models.search.SearchBar>,
             *         uiPrefs: <models.services.data.ui.Pref>
             *     }
             * }
             */
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);

                this.children.what = new What({
                    model: {
                        report: this.model.report,
                        application: this.model.application,
                        metaDataResult: this.model.metaDataResult,
                        serverInfo: this.model.serverInfo
                    }
                });

                this.children.searchHistory = new SearchHistoryView({
                    model: {
                        application: this.model.application,
                        searchBar: this.model.searchBar,
                        uiPrefs: this.model.uiPrefs
                    }
                });
    
                this.children.tableViewIntro = new TableView({
                    helpLink: route.docHelp(
                        this.model.application.get('root'),
                        this.model.application.get('locale'),
                        'learnmore.datasets.listing'),
                    datasetListing: route.datasets(
                        this.model.application.get('root'),
                        this.model.application.get('locale'),
                        this.model.application.get('app')),
                    createTableLink: route.table(
                        this.model.application.get('root'),
                        this.model.application.get('locale'),
                        this.model.application.get('app')),
                    showNewLabel: !this.options.isSearchTourViewed
                });

                this.children.searchHistoryToolTip = new SearchHistoryToolTipAdapter();
            },
            activate: function() {
                if (this.active) {
                    return Base.prototype.activate.apply(this, arguments);
                }
                var enableMetaData = splunkUtil.normalizeBoolean(this.model.report.entry.content.get('display.prefs.enableMetaData')),
                    showDataSummary = splunkUtil.normalizeBoolean(this.model.report.entry.content.get('display.prefs.showDataSummary'));

                if (enableMetaData || showDataSummary) {
                    this.children.what.activate().$el.show();
                    this.$('.column:not(.column-what)').addClass('.column-how');
                } else {
                    this.children.what.deactivate().$el.hide();
                    this.$('.column-how').removeClass('.column-how');
                }
                this.children.searchHistory.activate();
                return Base.prototype.activate.call(this, arguments);
            },

            render: function() {
                var root = this.model.application.get("root"),
                    locale = this.model.application.get("locale"),
                    enableMetaData = splunkUtil.normalizeBoolean(this.model.report.entry.content.get('display.prefs.enableMetaData')),
                    showDataSummary = splunkUtil.normalizeBoolean(this.model.report.entry.content.get('display.prefs.showDataSummary'));

                this.$el.html(this.compiledTemplate({
                    _: _,
                    docRoute: route.docHelp(root, locale, 'splunkcore.homepage.docs'),
                    tutorialDocRoute: route.docHelp(root, locale, 'search_app.tutorial'),
                    whatIsShown: enableMetaData || showDataSummary
                }));

                this.children.what.render().appendTo(this.$el.find('.button-container'));
                this.children.tableViewIntro.render().appendTo(this.$el.find('.column-table'));
                this.children.searchHistory.render().prependTo(this.$el);
                this.children.searchHistoryToolTip.render().appendTo(this.$el.find('.command-history-helper'));

                return this;
            },
            template: '\
                <div class="help">\
                    <div class="column help-column <% if (whatIsShown) { %> column-how <% } %>">\
                        <h2><%- _("How to Search").t() %></h2>\
                        <p><%- _("If you are not familiar with the search features, or want to learn more, or see your available data, see one of the following resources.").t() %></p>\
                        <div class="button-container">\
                            <a href="<%- docRoute %>" target="_blank" title="<%- _("Splunk help").t() %>" class="btn btn-documentation"><%- _("Documentation").t() %> <i class="icon-external"></i></a>\
                            <a href="<%- tutorialDocRoute %>" target="_blank" title="<%- _("Splunk help").t() %>" class="btn btn-documentation"><%- _("Tutorial").t() %> <i class="icon-external"></i></a>\
                        </div>\
                    </div>\
                    <div class="column help-column column-table"></div>\
                </div>\
            '
        });
    }
);
