import React, { Component } from 'react';
import PropTypes from 'prop-types';
import rum from '@splunk/rum';
import { _ } from '@splunk/ui-utils/i18n';
import ControlGroup from '@splunk/react-ui/ControlGroup';
import Text from '@splunk/react-ui/Text';
import Link from '@splunk/react-ui/Link';
import Switch from '@splunk/react-ui/Switch';
import Button from '@splunk/react-ui/Button';
import Modal from '@splunk/react-ui/Modal';
import RadioList from '@splunk/react-ui/RadioList';
import BannerStyles from 'util/global_banner/styles';
import SplunkUtil from 'splunk.util';
import Message from '@splunk/react-ui/Message';
import hashString from 'util/hash_string';
import { createTestHook } from 'util/test_support';
import './GlobalBannerSettings.pcss';

/* eslint-disable react/forbid-prop-types */
class GlobalBannerSettings extends Component {
    constructor(props) {
        super(props);
        const { options } = props;
        const { hasChanges } = options;
        this.state = {
            messages: [],
            isValidHyperlink: true,
            successModalOpen: hasChanges,
        };
    }
    componentDidMount() {
        rum.mark('Global banner view - First meaningful paint', { timeout: 0 });
    }
    getBannerProp = prop => this.props.model.globalBanner.entry.content.get(prop);
    setBannerProp = (prop, value) => {
        this.props.model.globalBanner.entry.content.set(prop, value);
        this.forceUpdate();
    };
    handleSave = () => {
        const { options } = this.props;
        const { onSettingsSaved } = options;

        const globalBannerVisible = this.getBannerProp('global_banner.visible');
        const globalBannerText = this.getBannerProp('global_banner.message');
        const globalBannerBGColor = this.getBannerProp('global_banner.background_color');
        const globalBannerHyperlink = this.getBannerProp('global_banner.hyperlink');
        const globalBannerHyperlinkText =
            this.getBannerProp('global_banner.hyperlink_text');
        const dataDefaults = {
            visible: false,
            message: _('Sample banner notification text. Please replace with your own message.'),
            backgroundColor: 'blue',
            hyperlink: '',
            hyperlinkText: '',
        };
        const data = {
            'global_banner.visible': globalBannerVisible !== undefined ? globalBannerVisible : dataDefaults.visible,
            'global_banner.message': globalBannerText || dataDefaults.message,
            'global_banner.background_color': globalBannerBGColor || dataDefaults.backgroundColor,
            'global_banner.hyperlink': globalBannerHyperlink || dataDefaults.hyperlink,
            'global_banner.hyperlink_text': globalBannerHyperlinkText || dataDefaults.hyperlinkText,
        };

        const valid = this.props.model.globalBanner.validate();
        if (!valid) {
            this.setState({ messages: [] });
            return;
        }
        this.props.model.globalBanner.save({}, {
            patch: true,
            data,
            success: () => {
                SplunkUtil.trackEvent({
                    type: 'globalBanner.interact',
                    data: {
                        action: 'save',
                        visible: data['global_banner.visible'],
                        backgroundColor: data['global_banner.background_color'],
                        messageLength: data['global_banner.message'].length,
                        hyperlinkLength: data['global_banner.hyperlink'].length,
                        hyperlinkTextLength: data['global_banner.hyperlink_text'].length,
                    },
                });
                onSettingsSaved();
            },
            error: (model, response) => {
                if (response.responseJSON && response.responseJSON.messages && response.responseJSON.messages[0]) {
                    const msg = response.responseJSON.messages[0].text;
                    this.setState({
                        messages: [
                            { msg: _(msg), type: 'error' },
                        ],
                    });
                }
                SplunkUtil.trackEvent({
                    type: 'globalBanner.error',
                    data: {
                        status: response.status,
                        responseText: response.responseText,
                    },
                });
            },
        });
    };
    updateHyperlinkErrorState = () => {
        const isValidHyperlink = this.props.model.globalBanner.isValidHyperlink();
        this.setState({ isValidHyperlink });
    };
    render() {
        const { options } = this.props;
        const { pageTitle } = options;
        const systemSettingsURL = 'systemsettings';

        const globalBannerVisible = this.getBannerProp('global_banner.visible');
        const globalBannerHyperlink = this.getBannerProp('global_banner.hyperlink');
        const globalBannerHyperlinkText =
            this.getBannerProp('global_banner.hyperlink_text');
        const globalBannerText = this.getBannerProp('global_banner.message');
        const globalBannerBGColor = this.getBannerProp('global_banner.background_color');

        const defaultMessage = _('Sample banner notification text. Please replace with your own message.');
        /* eslint-disable max-len */
        const pageDescription = _('The global banner allows admins to configure and communicate a single persistent banner message at the top of every Splunk Web page to all users.');
        const hyperlinkHelp = _('Links must start with http:// or https://. Links are appended to the end of the message.');
        /* eslint-enable max-len */

        const { messages, isValidHyperlink } = this.state;
        const messagesEl = messages.map(message => (
            <Message
                key={hashString(message.msg)}
                type={message.type}
            >
                {message.msg}
            </Message>
        ));

        return (
            <div className="global-banner" {...createTestHook(module.id)}>
                <div className="section-padded section-header">
                    <h1 className="section-title">{pageTitle}</h1>
                    <div className="breadcrumb">
                        <Link to={systemSettingsURL}>
                            {_('Server settings')}
                        </Link>
                        {` » ${pageTitle}`}
                    </div>
                </div>
                <div className="editFormWrapper">
                    <div className="formWrapper">
                        <div className="page-header">
                            <p>{pageDescription}</p>
                        </div>
                        {messagesEl}
                        <ControlGroup
                            data-test-name="visiblity-control-group"
                            className="banner-control-group"
                            id="visible-label"
                            label={_('Banner Visibility')}
                        >
                            <Switch
                                key="banner-visible"
                                value={globalBannerVisible}
                                selected={globalBannerVisible}
                                onClick={(e, { value }) => {
                                    this.setBannerProp('global_banner.visible', !value);
                                }}
                                appearance="toggle"
                                labelledBy="visible-label"
                            >
                                {globalBannerVisible ? _('On') : _('Off')}
                            </Switch>
                        </ControlGroup>
                        <ControlGroup
                            data-test-name="background-color-control-group"
                            className="banner-control-group"
                            label={_('Background Color')}
                        >
                            <RadioList
                                defaultValue={globalBannerBGColor}
                                onChange={(e, { value }) => {
                                    this.setBannerProp('global_banner.background_color', value);
                                }}
                            >
                                <RadioList.Option value="blue">
                                    <div
                                        className="banner-bg-color"
                                        style={{ backgroundColor: BannerStyles.blue.bg, color: BannerStyles.blue.text }}
                                    >
                                        {_('Blue')}
                                    </div>
                                </RadioList.Option>
                                <RadioList.Option value="green">
                                    <div
                                        className="banner-bg-color"
                                        style={{
                                            backgroundColor: BannerStyles.green.bg,
                                            color: BannerStyles.green.text,
                                        }}
                                    >
                                        {_('Green')}
                                    </div>
                                </RadioList.Option>
                                <RadioList.Option value="yellow">
                                    <div
                                        className="banner-bg-color"
                                        style={{
                                            backgroundColor: BannerStyles.yellow.bg,
                                            color: BannerStyles.yellow.text,
                                        }}
                                    >
                                        {_('Yellow')}
                                    </div>
                                </RadioList.Option>
                                <RadioList.Option value="orange">
                                    <div
                                        className="banner-bg-color"
                                        style={{
                                            backgroundColor: BannerStyles.orange.bg,
                                            color: BannerStyles.orange.text,
                                        }}
                                    >
                                        {_('Orange')}
                                    </div>
                                </RadioList.Option>
                                <RadioList.Option value="red">
                                    <div
                                        className="banner-bg-color"
                                        style={{ backgroundColor: BannerStyles.red.bg, color: BannerStyles.red.text }}
                                    >
                                        {_('Red')}
                                    </div>
                                </RadioList.Option>
                            </RadioList>
                        </ControlGroup>
                        <ControlGroup
                            data-test-name="message-control-group"
                            className="banner-control-group"
                            label={_('Message')}
                            help={_('Banner text is limited to one line, text is truncated afterward.')}
                        >
                            <Text
                                key="banner-message"
                                data-test-name="message-input"
                                placeholder={defaultMessage}
                                canClear
                                defaultValue={globalBannerText === defaultMessage ? undefined : globalBannerText}
                                onChange={(e, { value }) => {
                                    this.setBannerProp('global_banner.message', value);
                                }}
                            />
                        </ControlGroup>
                        <ControlGroup
                            data-test-name="hyperlink-control-group"
                            className="banner-control-group"
                            label={_('Hyperlink')}
                            help={hyperlinkHelp}
                            error={!isValidHyperlink}
                        >
                            <Text
                                key="banner-hyperlink"
                                data-test-name="hyperlink-input"
                                canClear
                                defaultValue={globalBannerHyperlink}
                                onChange={(e, { value }) => {
                                    this.setState({ isValidHyperlink: true });
                                    this.setBannerProp('global_banner.hyperlink', value);
                                }}
                                error={!isValidHyperlink}
                                onBlur={this.updateHyperlinkErrorState}
                            />
                        </ControlGroup>
                        <ControlGroup
                            data-test-name="hyperlink-text-control-group"
                            className="banner-control-group"
                            label={_('Hyperlink Text')}
                        >
                            <Text
                                key="banner-hyperlink-text"
                                data-test-name="hyperlink-text-input"
                                canClear
                                defaultValue={globalBannerHyperlinkText}
                                onChange={(e, { value }) => {
                                    this.setBannerProp('global_banner.hyperlink_text', value);
                                }}
                            />
                        </ControlGroup>
                    </div>
                    <div className="jmFormActions">
                        <Button
                            data-test-name="cancel-button"
                            to={systemSettingsURL}
                            label={_('Cancel')}
                            appearance="secondary"
                        />
                        <Button
                            data-test-name="save-button"
                            href="" label={_('Save')}
                            appearance="primary"
                            onClick={this.handleSave}
                        />
                    </div>
                </div>
                <Modal
                    data-test-name="success-modal"
                    onRequestClose={() => this.setState({ successModalOpen: false })}
                    open={this.state.successModalOpen}
                >
                    <Modal.Header
                        title={_('Changes Saved')}
                        onRequestClose={() => this.setState({ successModalOpen: false })}
                    />
                    <Modal.Body>
                        {_('Successfully updated settings.')}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            appearance="primary"
                            onClick={() => this.setState({ successModalOpen: false })}
                            label={_('Ok')}
                        />
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}

GlobalBannerSettings.propTypes = {
    model: PropTypes.object.isRequired,
    options: PropTypes.object.isRequired,
};

export default GlobalBannerSettings;
