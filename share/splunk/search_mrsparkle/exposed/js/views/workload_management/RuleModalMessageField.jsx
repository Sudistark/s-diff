import _ from 'underscore';
import { createTestHook } from 'util/test_support';
import React from 'react';
import PropTypes from 'prop-types';
import ControlGroup from '@splunk/react-ui/ControlGroup';
import Text from '@splunk/react-ui/Text';

const RuleMessageField = (props) => {
    const {
        ruleUpdateModalState,
        handleRuleUpdateModalTextChange,
    } = props;

    const labelWidth = 180;

    return (
        <div {...createTestHook(module.id)} className="rule-modal-message-field">
            <ControlGroup
                labelWidth={labelWidth}
                label={_('User Message').t()}
                data-test-name="RuleUpdateUserMessage"
                tooltip={_(`Enter a custom message to notify the end user when the rule is applied. 
                    For example: "The search matches the rule conditions. The specified action was taken."`).t()}
                help={ruleUpdateModalState.userMessageErrorMsg}
                error={ruleUpdateModalState.userMessageError}
            >
                <Text
                    multiline
                    rows={4}
                    disabled={ruleUpdateModalState.wait}
                    error={ruleUpdateModalState.userMessageError}
                    value={ruleUpdateModalState.user_message}
                    name="user_message"
                    onChange={handleRuleUpdateModalTextChange}
                    autoComplete={false}
                />
            </ControlGroup>
        </div>
    );
};

RuleMessageField.propTypes = {
    ruleUpdateModalState: PropTypes.shape({}).isRequired,
    handleRuleUpdateModalTextChange: PropTypes.func.isRequired,
};

export default RuleMessageField;
