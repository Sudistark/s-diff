import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { sprintf } from '@splunk/ui-utils/format';
import Button from '@splunk/react-ui/Button';
import Modal from '@splunk/react-ui/Modal';
import Link from '@splunk/react-ui/Link';
import Message from '@splunk/react-ui/Message';
import { _ } from '@splunk/ui-utils/i18n';
import { SPLUNK_DEV_DOCS_URL } from '../Utils';

class VettingErrorModal extends Component {

    static propTypes = {
        viewReportLink: PropTypes.string.isRequired,
        open: PropTypes.bool.isRequired,
        handleRequestClose: PropTypes.func.isRequired,
        vettingErrorCount: PropTypes.number.isRequired,
    };

    constructor(props, context) {
        super(props, context);
        this.state = {
            /** Boolean indicating whether the page is working (saving, deleting, ...). Used to disable button. */
            isWorking: false,
            /** String containing the error message, if any */
            errorMessage: '',
        };
    }

    handleClose = () => {
        this.setState({
            isWorking: false,
            errorMessage: '',
        });
        this.props.handleRequestClose();
    };

    render() {
        return (
            <div>
                <Modal
                    data-test-name="vetting-error-modal"
                    onRequestClose={this.handleClose}
                    open={this.props.open}
                >
                    <Modal.Header
                        data-test-name="vetting-error-modal-header"
                        title={_('App Vetting Complete')}
                    />
                    <Modal.Body data-test-name="vetting-error-modal-body">
                        {this.state.errorMessage && (<Message type="error">{this.state.errorMessage}</Message>)}
                        <Message
                            type="error"
                        >
                            <p>
                                <strong>
                                    {sprintf(_('%s issues '), this.props.vettingErrorCount)}
                                </strong>
                                found.
                            </p>
                            <p>
                                {_('You must fix these issues before you can install your ' +
                                'app. for details, see the ')}
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
                        </Message>
                    </Modal.Body>
                    <Modal.Footer data-test-name="vetting-error-modal-footer">
                        <Button
                            data-test-name="ack-cancel-btn"
                            onClick={this.handleClose}
                            label={_('Cancel')}
                        />
                        <Button
                            appearance="primary"
                            to={this.props.viewReportLink}
                            openInNewContext
                            data-test-name="ack-failed-view-report-btn"
                            label={_('View Report')}
                        />
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}

export default VettingErrorModal;
