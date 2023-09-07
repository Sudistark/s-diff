import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import Modal from '@splunk/react-ui/Modal';
import Button from '@splunk/react-ui/Button';
import Switch from '@splunk/react-ui/Switch';
import { _ } from '@splunk/ui-utils/i18n';

const StyledSwitch = styled(Switch)`
    float: left;
`;

// To ensure a really long url doesn't force the modal to expand or scroll
const StyledUrl = styled.p`
    word-break: break-word;
`;

const TEXT = {
    TITLE: _('Redirecting away from Splunk'),
    REDIRECT: _('You are being redirected away from Splunk to the following URL:'),
    CONTINUE: _('Continue'),
    CANCEL: _('Cancel'),
    ALLOW_AND_DONT_ASK: _("Don't show this again"),
    NOTE: _('Note that tokens embedded in a URL could contain sensitive information.'),
};


const UrlWarningModal = ({
    url,
    onConfirm,
    onRequestClose,
    onAddUrlToAllowList,
    ...rest
}) => {
    const [isDontAskChecked, setIsDontAskChecked] = useState(false);

    const handleClose = useCallback(() => {
        if (typeof onRequestClose === 'function') {
            onRequestClose();
        }
    }, [onRequestClose]);

    const handleAllow = useCallback(() => {
        if (url) {
            if (typeof onAddUrlToAllowList === 'function' && isDontAskChecked) {
                onAddUrlToAllowList(url);
            }
            onConfirm(url);
        }

        handleClose();
    }, [url, isDontAskChecked, handleClose, onAddUrlToAllowList]);

    const handleDontAsk = useCallback((_e, { selected }) => {
        setIsDontAskChecked(!selected);
    }, []);

    return (
        <React.Fragment>
            <Modal onRequestClose={handleClose} open={!!url} {...rest}>
                <Modal.Header title={TEXT.TITLE} onRequestClose={handleClose} />
                <Modal.Body>
                    <p>{TEXT.REDIRECT}</p>
                    <StyledUrl>{url}</StyledUrl>
                    <p>{TEXT.NOTE}</p>
                </Modal.Body>
                <Modal.Footer>
                    {typeof onAddUrlToAllowList === 'function' && (
                        <StyledSwitch
                            selected={isDontAskChecked}
                            onClick={handleDontAsk}
                            appearance="checkbox"
                            inline
                        >
                            {TEXT.ALLOW_AND_DONT_ASK}
                        </StyledSwitch>
                    )}
                    <Button
                        appearance="secondary"
                        onClick={handleClose}
                        label={TEXT.CANCEL}
                        data-test-name="cancel"
                    />
                    <Button
                        appearance="primary"
                        onClick={handleAllow}
                        label={TEXT.CONTINUE}
                        data-test-name="continue"
                    />
                </Modal.Footer>
            </Modal>
        </React.Fragment>
    );
};

UrlWarningModal.propTypes = {
    url: PropTypes.string.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onRequestClose: PropTypes.func.isRequired,
    onAddUrlToAllowList: PropTypes.func,
};

UrlWarningModal.defaultProps = {
    onAddUrlToAllowList: () => {},
};

export default UrlWarningModal;