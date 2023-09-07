import $ from 'jquery';
import routerUtils from 'util/router_utils';
import BaseRouter from './Base';

/*
routeUrlHandler is the first iteration of changes made as we transition from
an inheritance architecture to a compositional architecture. Instead of a router
file inheriting from the monolithic BaseRouter, the consumer can simply call
the routeUrlHandler function with an array of configuration objects. The expected format is:
[{
  route: <url>,
  callback: <callback when url is accessed>,
  setPageRoot: <bool - true will set the pages root to the new root>,
}]
See SPL-186763 for more information.
*/
export default function routeUrlHandler(routeConfigs) {
    // Creating (with inheritance) a new base router implementation
    const Router = BaseRouter.extend({
        initialize(...args) {
            BaseRouter.prototype.initialize.call(this, ...args);
        },
        // Adapt routes given to BaseRouterComposed into format expected by Backbone, with the
        // route str as the key and the callback function as the value. Backbone accepts either a
        // functions in the router or, as seen below, a direct function definition.
        routes: routeConfigs.reduce((backboneRoutes, configObj) => {
            backboneRoutes[configObj.route] = function wrapper() { // eslint-disable-line no-param-reassign
                $.when(
                    this.deferreds.pageViewRendered,
                ).done(() => {
                    $('.preload').replaceWith(this.pageView.el);
                    if (configObj.setPageRoot) {
                        this.model.application.set(
                            { root: [...arguments][0] }, // eslint-disable-line prefer-rest-params
                            { silent: true },
                        );
                    }
                    // Call route's corresponding callback function to render view
                    configObj.callback.call(this, ...arguments); // eslint-disable-line prefer-rest-params
                });
                BaseRouter.prototype.page.apply(this, arguments); // eslint-disable-line prefer-rest-params
            };
            return backboneRoutes;
        }, {}),
    });
    new Router(); // eslint-disable-line no-new
    routerUtils.start_backbone_history();
}
