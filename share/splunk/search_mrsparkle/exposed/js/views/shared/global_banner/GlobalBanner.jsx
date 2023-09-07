import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SplunkUtil from 'splunk.util';
import rum from '@splunk/rum';
import { _ } from '@splunk/ui-utils/i18n';
import Link from '@splunk/react-ui/Link';
import BannerStyles from 'util/global_banner/styles';
import { createTestHook } from 'util/test_support';
import './GlobalBanner.pcss';

/* eslint-disable react/forbid-prop-types */
class GlobalBanner extends Component {
    componentDidMount() {
        rum.mark('Global Banner - First meaningful paint', { timeout: 0 });
    }

    getBannerProp = prop => this.props.model.globalBanner.entry.content.get(prop);

    getBannerProps = () => {
        const defaultProps = {
            textColor: BannerStyles.blue.text,
            backgroundColor: BannerStyles.blue.bg,
            globalBannerText: _('Sample banner notification text. Please replace with your own message.'),
        };
        const textColor = this.props.model.globalBanner.getTextColor();
        const backgroundColor = this.props.model.globalBanner.getBackgroundColor();
        const globalBannerText = this.getBannerProp('global_banner.message');
        const hyperlink = this.getBannerProp('global_banner.hyperlink');
        const hyperlinkText = this.getBannerProp('global_banner.hyperlink_text');
        return {
            textColor: textColor || defaultProps.textColor,
            backgroundColor: backgroundColor || defaultProps.backgroundColor,
            globalBannerText: globalBannerText || defaultProps.globalBannerText,
            hyperlink,
            hyperlinkText,
        };
    };

    handleLinkClick = () => {
        SplunkUtil.trackEvent({
            type: 'globalBanner.interact',
            data: {
                action: 'link click',
            },
        });
    };

    // Manager pages' action buttons are absolutely positioned.
    // Existing implementation updates the offset of these buttons via the adjustButtons function.
    updateManagerPageLayout = () => {
        // If we're on a manager page, update the layout of action buttons.
        if (window.adjustButtons) {
            window.adjustButtons(true);
        }
    };

    render() {
        const visible = this.getBannerProp('global_banner.visible');
        if (!visible) {
            return null;
        }

        this.updateManagerPageLayout();

        const { textColor, backgroundColor, globalBannerText, hyperlink, hyperlinkText } = this.getBannerProps();

        const hyperlinkEl = hyperlink ? (
            <Link
                className="banner-link"
                to={hyperlink}
                style={{ color: textColor }}
                openInNewContext
                onClick={this.handleLinkClick}
            >
                {hyperlinkText || hyperlink}
            </Link>
        ) : null;

        return (
            <div
                {...createTestHook(module.id)}
                className="single-global-banner"
                style={{ color: textColor, backgroundColor }}
            >
                <p
                    className="banner-text"
                    style={{ color: textColor }}
                    title={globalBannerText}
                >
                    {globalBannerText}
                </p>
                {hyperlinkEl}
            </div>
        );
    }
}

GlobalBanner.propTypes = {
    model: PropTypes.object.isRequired,
};

export default GlobalBanner;
