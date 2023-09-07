/**
 * Creates the global banner settings page.
 */
define([
        'routers/GlobalBanner',
        'util/router_utils'
    ],
    function(
        GlobalBannerRouter,
        router_utils
    ){
        var globalBannerRouter = new GlobalBannerRouter();
        router_utils.start_backbone_history();
    }
);
