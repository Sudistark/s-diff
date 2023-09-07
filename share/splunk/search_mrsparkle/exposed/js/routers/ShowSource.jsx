import { _ } from 'underscore';
import $ from 'jquery';
import React from 'react';
import { render } from 'react-dom';
import BaseRouter from 'routers/Base';
import { getReactUITheme, ThemeProvider } from 'util/theme_utils';
import classicurlModel from 'models/classicurl';
import ShowSourceModel from 'views/show_source/model';


const ShowSourceRouter = BaseRouter.extend({
    routes: {
        ':locale/app/:app/show_source*splat': 'showSource',
        '*root/:locale/app/:app/show_source*splat': 'showSource',
    },

    i18nStrings: {
        error: {
            status: _('404 Not Found').t(),
            message: _('Page not found!').t(),
        },
        noContent: _('No content available.').t(),
        noSid: _('No sid was specified.').t(),
        heading: _('Show Source').t(),
    },

    initialize(...args) {
        BaseRouter.prototype.initialize.call(this, ...args);
        this.enableAppBar = false;
    },
    showSource(locale, app) {
        BaseRouter.prototype.page.apply(this, [locale, app, 'show_source']); // eslint-disable-line prefer-rest-params

        this.setPageTitle(this.i18nStrings.heading);
        $.when(this.deferreds.pageViewRendered).then(() => {
            $('.preload').replaceWith(this.pageView.el);

            const props = {
                textStrings: this.i18nStrings,
                sid: classicurlModel.get('sid'),
                offset: classicurlModel.get('offset') || 0,
                latest_time: classicurlModel.get('latest_time') || 0,
                max_lines: classicurlModel.get('max_lines_constraint') || 500,
                count: classicurlModel.get('count') || 50,
            };

            render(
                <ThemeProvider theme={getReactUITheme()}>
                    <ShowSourceModel {...props} />
                </ThemeProvider>,
            this.pageView.$('.main-section-body').get(0),
        );
        });
    },

});

export default ShowSourceRouter;