import React from 'react';
import PropTypes from 'prop-types';
import Button from '@splunk/react-ui/Button';
import Modal from '@splunk/react-ui/Modal';
import Message from '@splunk/react-ui/Message';
import { _ } from '@splunk/ui-utils/i18n';
import { sprintf } from '@splunk/ui-utils/format';

const InstallSuccessModal = props => (
    <div>
        <Modal
            data-test-name="install-success-modal"
            onRequestClose={props.handleRequestClose}
            open={props.open}
        >
            <Modal.Header
                data-test-name="install-success-modal-header"
                title={_('App Installation Complete')}
            />
            <Modal.Body data-test-name="vetting-error-modal-body">
                <Message
                    type="success"
                >
                    {sprintf(_('%s has been successfully installed. '),
                        props.appName)}
                </Message>
            </Modal.Body>
            <Modal.Footer data-test-name="install-success-modal-footer">
                <Button
                    appearance="primary"
                    data-test-name="ack-cancel-btn"
                    onClick={props.handleRequestClose}
                    label={_('Done')}
                />
            </Modal.Footer>
        </Modal>
    </div>
);

InstallSuccessModal.propTypes = {
    appName: PropTypes.string.isRequired,
    open: PropTypes.bool.isRequired,
    handleRequestClose: PropTypes.func.isRequired,
};

export default InstallSuccessModal;
