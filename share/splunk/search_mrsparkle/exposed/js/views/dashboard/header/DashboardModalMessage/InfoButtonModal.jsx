import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { _ } from '@splunk/ui-utils/i18n';
import Clickable from '@splunk/react-ui/Clickable';
import Modal from '@splunk/react-ui/Modal';
import InfoCircle from '@splunk/react-icons/InfoCircle';
import { variable } from '@splunk/react-ui/themes';

const StyledClickable = styled(Clickable)`
    font-size: 20px;
    vertical-align: middle;
    display: inline-block;
    color: ${variable('linkColor')};
    &:focus {
        box-shadow: ${variable('focusShadow')};
        background-color: ${variable('focusBackgroundColor')};
    }
`;

const InfoButtonModal = ({ dialogTitle, children }) => {
    const [open, setOpen] = useState(false);
    const buttonEl = useRef(null);
    const toggle = (
        <StyledClickable
            ref={buttonEl}
            aria-label={_('Dashboard Messages')}
            onClick={() => setOpen(true)}
        >
            <InfoCircle screenReaderText={null} />
        </StyledClickable>
    );

    const handleRequestClose = () => {
        setOpen(false);
        buttonEl.current.focus();
    };

    return (
        <React.Fragment>
            {toggle}
            <Modal onRequestClose={handleRequestClose} open={open}>
                <Modal.Header title={dialogTitle} onRequestClose={handleRequestClose} />
                <Modal.Body>
                    {children}
                </Modal.Body>
            </Modal>
        </React.Fragment>
    );
};

InfoButtonModal.propTypes = {
    dialogTitle: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
};

export default InfoButtonModal;
