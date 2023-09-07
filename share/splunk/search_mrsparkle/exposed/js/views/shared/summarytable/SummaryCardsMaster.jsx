import React from 'react';
import { ThemeProvider } from 'util/theme_utils';
import ReactAdapterBase from 'views/ReactAdapterBase';
import ReactDOM from 'react-dom';
import BackboneProvider from 'dashboard/components/shared/BackboneProvider';
import SummaryCardsLayout from './SummaryCardsLayout';

export default ReactAdapterBase.extend({
    getComponent(args) {
        const props = { ...args, ...this };
        return (
            <BackboneProvider store={{}}>
                <SummaryCardsLayout {...props} />
            </BackboneProvider>
        );
    },
    render(args) {
        ReactDOM.render(
            React.createElement(ThemeProvider, { theme: this.getTheme() }, this.getComponent(args)),
            this.el);
        return this;
    },
});