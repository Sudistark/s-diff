import _ from 'underscore';
import { createTestHook } from 'util/test_support';
import React from 'react';
import PropTypes from 'prop-types';
import Modal from '@splunk/react-ui/Modal';
import WaitSpinner from '@splunk/react-ui/WaitSpinner';
import Button from '@splunk/react-ui/Button';

const RuleMessageField = (props) => {
    const {
        ruleUpdateModalState,
        handleRuleUpdateModalClose,
        handleRuleUpdateModalSubmit,
    } = props;

    return (
        <div {...createTestHook(module.id)} className="rule-modal-footer-field">
            { ruleUpdateModalState.wait ?
                <Modal.Footer>
                    <WaitSpinner size="medium" />
                </Modal.Footer> :
                <Modal.Footer>
                    <Button
                        data-test-name="cancel"
                        appearance="secondary"
                        onClick={handleRuleUpdateModalClose}
                        label={_('Cancel').t()}
                    />
                    <Button
                        data-test-name="submit"
                        disabled={
                            ruleUpdateModalState.nameError
                            || ruleUpdateModalState.orderError
                            || !ruleUpdateModalState.changed
                        }
                        appearance="primary"
                        onClick={handleRuleUpdateModalSubmit}
                        label={_('Submit').t()}
                    />
                </Modal.Footer>
            }
        </div>
    );
};

RuleMessageField.propTypes = {
    ruleUpdateModalState: PropTypes.shape({}).isRequired,
    handleRuleUpdateModalClose: PropTypes.func.isRequired,
    handleRuleUpdateModalSubmit: PropTypes.func.isRequired,
};

export default RuleMessageField;
