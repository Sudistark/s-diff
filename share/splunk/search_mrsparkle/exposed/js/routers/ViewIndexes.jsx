import $ from 'jquery';
import React from 'react';
import Backbone from 'backbone';
import querystring from 'querystring';
import { render } from 'react-dom';
import { _ } from '@splunk/ui-utils/i18n';
import { getReactUITheme, ThemeProvider } from 'util/theme_utils';
import ErrorView from 'views/error/Master';
import Master from 'views/view_indexes/Master';
import routeUrlHandler from './routeUrlHandler';

export function notSupported() {
    // Only reachable via manual change of the URL automatically generated from Users/Roles list pages.
    // For consistency with other pages, an invalid URL typed by the user will display the 'Oops' page.
    window.document.title = _('404 Not Found');
    const errorView = new ErrorView({
        model: {
            application: this.model.application,
            error: new Backbone.Model({
                status: _('404 Not Found'),
                message: _('Page not found!'),
            }),
        },
    });
    $('.main-section-body').append(errorView.render().el);
}

export function checkParams(locale, app, params) {
    const { entityType, entity } = querystring.parse(params);
    if (!!entityType && (entityType === 'users' || entityType === 'roles')) {
        const props = {
            entity,
            entityType,
        };
        render(
            <ThemeProvider theme={getReactUITheme()}>
                <Master {...props} />
            </ThemeProvider>,
            $('.main-section-body')[0],
        );
    } else {
        // Render error view if required params not present
        notSupported.call(this);
    }
}

export function viewIndexesRouter() {
    routeUrlHandler([
        {
            route: ':locale/manager/:app/auth/view_indexes?*params(/)',
            callback: checkParams,
        },
        {
            route: 'root*/:locale/manager/:app/auth/view_indexes?*params(/)',
            callback: checkParams,
            setPageRoot: true,
        },
        {
            route: '*splat',
            callback: notSupported,
        },
    ]);
}
