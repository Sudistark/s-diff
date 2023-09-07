define(
    [
        'jquery',
        'underscore',
        'collections/services/authentication/Users',
        'models/services/saved/Search',
        'models/Base',
        'models/classicurl',
        'views/saved_searches_advancededit/Master',
        'routers/Base',
        'uri/route',
        'splunk.util',
        'util/splunkd_utils',
        'helpers/managementconsole/url',
        'util/htmlcleaner'
    ],
    function(
        $,
        _,
        UsersCollection,
        SearchModel,
        SplunkModel,
        classicurlModel,
        EditView,
        BaseRouter,
        route,
        splunkUtil,
        splunkd_utils,
        urlHelper,
        HtmlCleaner
    ) {
        return BaseRouter.extend({
            initialize: function() {
                BaseRouter.prototype.initialize.apply(this, arguments);

                this.fetchAppLocals = true;
                this.enableAppBar = false;

                // Models
                this.model.editModel = new SearchModel();
                this.model.state = new SplunkModel();

                this.queryOptions = {};
                this.paramList = ['ns', 'pwnr', 'search', 'count'];
                this.backToListUrl = '';
            },

            startListening: function() {
                this.listenTo(this.model.state, 'BackToList', function(){
                    if (this.backToListUrl) {
                         window.location.href = this.backToListUrl;
                    }
                });
            },

            getUrlParaArray: function() {
                var options = {},
                    paraArray = [
                        this.model.application.get('root'),
                        this.model.application.get('locale'),
                        this.model.application.get('app'),
                        [this.model.application.get('page'), 'searches']
                    ];

                this.paramList.forEach(function(param) {
                    if (classicurlModel.get(param)) {
                        this.queryOptions[param] = classicurlModel.get(param);
                    }
                }, this);

                if (!_.isEmpty(this.queryOptions)) {
                    options = {data: this.queryOptions};
                }

                if (!_.isEmpty(options)) {
                    paraArray.push(options);
                }
                return paraArray;
            },

            page: function(locale, app, page) {
                BaseRouter.prototype.page.apply(this, arguments);
                //Check for IP addresses, urls, or malicious code
                if (decodeURIComponent(classicurlModel.get('s')).match(/^\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b$/) || 
                    decodeURIComponent(classicurlModel.get('s')).includes("://") || HtmlCleaner.isBadUrl(decodeURIComponent(classicurlModel.get('s')))){
                    window.location.href = urlHelper.setupUrl('error');
                } //Check for allowed parameter arguments before fetching
                if (decodeURIComponent(classicurlModel.get('s')).match(/^[\w\/\.\-\s%#]+$/) ){
                    classicurlModel.fetch({
                        success: function() {
                            var editModelDeferred = $.Deferred(),
                                idAttribute = this.model.editModel.idAttribute;

                            this.backToListUrl = route.manager.apply(undefined, this.getUrlParaArray());
                            
                            this.model.editModel.set(idAttribute, classicurlModel.get('s'));
                            if (this.model.editModel.get(idAttribute)) {
                                this.model.editModel.fetch({
                                    success: function(model, response) {
                                        editModelDeferred.resolve();
                                    }.bind(this),
                                    error: function(model, response) {
                                        editModelDeferred.resolve();
                                    }
                                });
                            } else {
                                var noSearchIdError = splunkd_utils.createSplunkDMessage(
                                    splunkd_utils.FATAL,
                                    _("No search was specified.").t());
                                this.model.editModel.trigger("error", this.model.editModel, noSearchIdError);
                                editModelDeferred.resolve();
                            }

                            $.when(this.deferreds.pageViewRendered, editModelDeferred).then(function() {
                                this.editView = new EditView({
                                    model: {
                                        editModel: this.model.editModel,
                                        state: this.model.state
                                    },
                                    backToListUrl: this.backToListUrl
                                });

                                this.startListening();

                                this.setPageTitle(this.model.editModel.entry.get('name') || _('Saved Search').t());
                                this.pageView.$('.main-section-body').html(this.editView.render().el);
                                $('.preload').replaceWith(this.pageView.el);
                            }.bind(this));

                        }.bind(this)
                    }); 
                } else {
                    window.location.href = urlHelper.setupUrl('error');

                }       
            }
        });
    }
);