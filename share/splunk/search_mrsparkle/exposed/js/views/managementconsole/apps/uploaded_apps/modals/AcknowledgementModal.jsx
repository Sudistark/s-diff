import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '@splunk/react-ui/Button';
import Modal from '@splunk/react-ui/Modal';
import Switch from '@splunk/react-ui/Switch';
import Message from '@splunk/react-ui/Message';
import Link from '@splunk/react-ui/Link';
import { _ } from '@splunk/ui-utils/i18n';
import { sprintf } from '@splunk/ui-utils/format';
import { createDocsURL } from '@splunk/splunk-utils/url';
import { callAcknowledgeRisk, SPLUNK_DEV_DOCS_URL } from '../Utils';

class AcknowledgementModal extends Component {

    static propTypes = {
        packageId: PropTypes.string.isRequired,
        open: PropTypes.bool.isRequired,
        handleRequestClose: PropTypes.func.isRequired,
        onInstallPackage: PropTypes.func.isRequired,
        vettingWarningCount: PropTypes.string,
        viewReportLink: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
    };

    static defaultProps = {
        vettingWarningCount: '0',
    };

    constructor(props, context) {
        super(props, context);
        this.state = {
            /** Boolean indicating whether the page is working (saving, deleting, ...). Used to disable button. */
            isWorking: false,
            /** String containing the error message, if any */
            errorMessage: '',
            acknowledged: false,
        };
    }

    hasWarnings = () => this.props.vettingWarningCount > 0

    handleAcknowledgementSelectClick = () => {
        this.setState({
            acknowledged: !this.state.acknowledged,
        });
    };

    handleInstallButtonClick = () => {
        this.setState({
            isWorking: true,
        });
        callAcknowledgeRisk(this.props.packageId, this.state.acknowledged)
        .then(() => {
            this.setState({
                errorMessage: '',
            });
            this.props.onInstallPackage();
        })
        .catch((response) => {
            if (response.status === 405) {
                this.setState({
                    errorMessage: '',
                });
                this.props.onInstallPackage();
            } else {
                this.setState({
                    isWorking: false,
                    errorMessage: _('Acknowledgement failed.'),
                });
            }
        });
    }

    handleClose = () => {
        this.setState({
            isWorking: false,
            errorMessage: '',
            acknowledged: false,
        });
        this.props.handleRequestClose();
    };

    render() {
        return (
            <div>
                <Modal
                    data-test-name="acknowledgement-modal"
                    onRequestClose={this.handleClose}
                    open={this.props.open}
                >
                    <Modal.Header
                        data-test-name="acknowledgement-modal-header"
                        title={this.props.title}
                        onRequestClose={this.handleClose}
                    />
                    <Modal.Body data-test-name="acknowledgement-modal-body">
                        {this.state.errorMessage && (<Message type="error">{this.state.errorMessage}</Message>)}
                        <Message
                            type={this.hasWarnings() ? 'warning' : 'success'}
                        >
                            {this.hasWarnings() && (
                                <div>
                                    <p>
                                        <strong>
                                            {sprintf(_('%s warning issues '), this.props.vettingWarningCount)}
                                        </strong>
                                        {_('found.')}
                                    </p>
                                    <p>
                                        {_('We suggest that you fix these issues before you install the ' +
                                            'app. For details, see the ')}
                                        <Link
                                            to={this.props.viewReportLink}
                                            openInNewContext
                                        >
                                            {_('report')}
                                        </Link>
                                        {_('. For help, see the ')}
                                        <Link
                                            to={SPLUNK_DEV_DOCS_URL}
                                            openInNewContext
                                        >
                                            {_('Splunk Developer Docs.')}
                                        </Link>
                                    </p>
                                </div>
                            )}
                            <p>
                                {_('To install your app, you must first acknowledge the following terms')}
                            </p>
                            <p>
                                {_('I acknowledge that Splunk is not responsible for the installation or ' +
                                'use of any application that is not a supported Splunk application and Splunk ' +
                                'specifically disclaims the accuracy, integrity, quality, legality, usefulness ' +
                                'or security of such application or its use. Installation and use of an ' +
                                'application that is not a supported Splunk application is at your own risk. ' +
                                'Please note that if data leaves Splunk Cloud as a result of installing or ' +
                                'using such application, Splunk’s security attestations do not apply to data ' +
                                'outside Splunk Cloud. ')}
                                <Link
                                    to={createDocsURL('learnmore.private_apps')}
                                    openInNewContext
                                >
                                    {_('[Learn more about installing private apps.]')}
                                </Link>
                            </p>
                            <Switch
                                data-test-name="acknowledgement-switch"
                                onClick={this.handleAcknowledgementSelectClick}
                                selected={this.state.acknowledged}
                                appearance="checkbox"
                            >
                                {_('Acknowledge')}
                            </Switch>
                        </Message>
                    </Modal.Body>
                    <Modal.Footer data-test-name="acknowledgement-modal-footer">
                        <Button
                            appearance="primary"
                            data-test-name="ack-cancel-btn"
                            onClick={this.handleClose}
                            label={_('Cancel')}
                        />
                        <Button
                            data-test-name="ack-install-btn"
                            disabled={!this.state.acknowledged || this.state.isWorking}
                            onClick={this.handleInstallButtonClick}
                            label={this.state.isWorking ? _('Working...') : _('Install')}
                        />
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}

export default AcknowledgementModal;
