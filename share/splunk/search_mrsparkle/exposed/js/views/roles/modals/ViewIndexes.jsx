import React from 'react';
import PropTypes from 'prop-types';
import Button from '@splunk/react-ui/Button';
import Modal from '@splunk/react-ui/Modal';
import { _ } from '@splunk/ui-utils/i18n';
import { createTestHook } from 'util/test_support';
import ViewIndexes from 'views/view_indexes/View';

const ViewIndexesModal = props => (
    <div>
        <Modal
            {...createTestHook(null, 'viewIndexesModal')}
            onRequestClose={props.handleRequestClose}
            open={props.open}
            style={{ width: '80%' }}
        >
            <Modal.Header
                title={_(`View index inheritance for role ${props.object[props.nameAttribute]}`)}
                onRequestClose={props.handleRequestClose}
            />
            <Modal.Body
                style={{ backgroundColor: '#f2f5f4' }}
            >
                <ViewIndexes
                    entityType={'roles'}
                    entity={props.object[props.nameAttribute]}
                    showHeading={false}
                />
            </Modal.Body>
            <Modal.Footer>
                <Button
                    {...createTestHook(null, 'viewIndexes-cancel-btn')}
                    onClick={props.handleRequestClose}
                    label={_('Cancel')}
                />
            </Modal.Footer>
        </Modal>
    </div>
);


ViewIndexesModal.propTypes = {
    open: PropTypes.bool,
    object: PropTypes.shape({
        name: PropTypes.string.isRequired,
    }).isRequired,
    nameAttribute: PropTypes.string.isRequired,
    handleRequestClose: PropTypes.func.isRequired,
};

ViewIndexesModal.defaultProps = {
    open: false,
};

export default ViewIndexesModal;
