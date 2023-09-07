import React from 'react';
import PropTypes from 'prop-types';
import { sprintf } from '@splunk/ui-utils/format';
import Modal from '@splunk/react-ui/Modal';
import { _ } from '@splunk/ui-utils/i18n';
import { APP_VETTING_IN_PROGRESS_MSG, APP_INSTALLATION_IN_PROGRESS_MSG } from '../Utils';

const VettingProgressModal = props => (
    <div>
        <Modal
            data-test-name="progress-modal"
            open={props.open}
        >
            <Modal.Header
                data-test-name="progress-modal-header"
                title={sprintf(_('App %s in Progress'), props.action === 'installing' ?
                    _('Installation') : _('Vetting'))}
            />
            <Modal.Body data-test-name="progress-modal-body">
                <div>
                    {sprintf(
                        (props.action === 'installing' ?
                        APP_INSTALLATION_IN_PROGRESS_MSG :
                        APP_VETTING_IN_PROGRESS_MSG), props.packageName)}
                </div>
            </Modal.Body>
        </Modal>
    </div>
);

VettingProgressModal.propTypes = {
    packageName: PropTypes.string.isRequired,
    open: PropTypes.bool.isRequired,
    action: PropTypes.string.isRequired,
};

export default VettingProgressModal;
