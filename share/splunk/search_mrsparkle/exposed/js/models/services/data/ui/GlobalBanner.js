define(
    [
        'underscore',
        'util/splunkd_utils',
        'models/SplunkDBase',
        'util/global_banner/styles'
    ],
    function(_, splunkd_utils, SplunkDBaseModel, BannerStyles) {
        return SplunkDBaseModel.extend({
            url: 'data/ui/global-banner',
            initialize: function() {
                SplunkDBaseModel.prototype.initialize.apply(this, arguments);

                // Always reference the same global banner message.
                // Always GET and SET at system namespace, otherwise if
                // a user defined .conf exists, it will not set for all users.
                var relative_id = 'data/ui/global-banner/BANNER_MESSAGE_SINGLETON';
                var id = splunkd_utils.fullpath(relative_id, {
                    app: 'system',
                    owner: 'nobody'
                });
                this.set('id', id);
            },
            validation: {
                'global_banner.hyperlink': 'isValidHyperlink'
            },
            isValidHyperlink: function() {
                var hyperlink = this.entry.content.get('global_banner.hyperlink');
                return !hyperlink || hyperlink.indexOf('https://') === 0 || hyperlink.indexOf('http://') === 0;
            },
            globalBannerVisible: function() {
                var visible = this.entry.content.get('global_banner.visible');
                return Number(visible) || 0;
            },
            getTextColor: function() {
                var colorMap = {
                    green: BannerStyles.green.text,
                    blue: BannerStyles.blue.text,
                    yellow: BannerStyles.yellow.text,
                    orange: BannerStyles.orange.text,
                    red: BannerStyles.red.text,
                };
                var backgroundColor = this.entry.content.get('global_banner.background_color');
                return colorMap[backgroundColor] || BannerStyles.blue.text;
            },
            getBackgroundColor: function() {
                var colorMap = {
                    green: BannerStyles.green.bg,
                    blue: BannerStyles.blue.bg,
                    yellow: BannerStyles.yellow.bg,
                    orange: BannerStyles.orange.bg,
                    red: BannerStyles.red.bg
                };
                var backgroundColor = this.entry.content.get('global_banner.background_color');
                return colorMap[backgroundColor] || BannerStyles.blue.bg;
            }
        });
    }
);
