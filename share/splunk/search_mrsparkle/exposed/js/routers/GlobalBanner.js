/**
 * Router for the global banner settings page.
 */
define(
    [
        'jquery',
        'underscore',
        'splunk.util',
        'routers/Base',
        'models/services/data/ui/GlobalBanner',
        'views/global_banner/ReactAdapterMaster',
        'util/url_parser'
    ],
    function(
        $,
        _,
        SplunkUtil,
        BaseRouter,
        GlobalBannerModel,
        ReactAdapterMasterView,
        urlParser
    ) {
        return BaseRouter.extend({
            initialize: function(options) {
                BaseRouter.prototype.initialize.apply(this, arguments);
                this.options = options || {};
                this.enableAppBar = false;
                var location = this.getLocationHref(this.options);
                this.hasChanges = urlParser.getHasChangesFlag(location);
                urlParser.removeURLFlag(location, 'has_changes');
            },

            getLocationHref: function(options) {
                return options.location || location.href;
            },

            handleSettingsSaved: function() {
                urlParser.setURLFlag(this.getLocationHref(this.options), 'has_changes', 1);
                location.reload();
            },

            page: function(locale, app, page) {
                BaseRouter.prototype.page.apply(this, arguments);
                var pageTitle = _('Customize global banner').t();
                this.setPageTitle(pageTitle);

                $.when(this.deferreds.pageViewRendered, this.deferreds.globalBanner).then(function() {
                    this.masterView = new ReactAdapterMasterView({
                        model: {
                            globalBanner: this.model.globalBanner
                        },
                        onSettingsSaved: this.handleSettingsSaved.bind(this),
                        hasChanges: this.hasChanges,
                        pageTitle: pageTitle
                    });
                    $('.preload').replaceWith(this.pageView.el);
                    this.pageView.$('.main-section-body').append(this.masterView.render().el);
                }.bind(this));
            }
        });
    }
);
