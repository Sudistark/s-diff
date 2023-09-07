import _ from 'underscore';
import { createTestHook } from 'util/test_support';
import React from 'react';
import PropTypes from 'prop-types';
import ControlGroup from '@splunk/react-ui/ControlGroup';
import Modal from '@splunk/react-ui/Modal';
import P from '@splunk/react-ui/Paragraph';
import Text from '@splunk/react-ui/Text';
import Select from '@splunk/react-ui/Select';
import Message from '@splunk/react-ui/Message';
import RuleModalScheduleField from './RuleModalScheduleField';
import RuleModalFooter from './RuleModalFooter';
import RuleModalMessageField from './RuleModalMessageField';

const AdmissionRuleModal = (props) => {
    const {
        admissionModalOpen,
        ruleUpdateModalState,
        handleRuleUpdateModalClose,
        handleRuleUpdateModalTextChange,
        handleRuleUpdateModalMultiSelectChange,
        handleRuleUpdateModalSubmit,
    } = props;

    const RuleModalScheduleFieldProps = {
        ruleUpdateModalState,
        handleRuleUpdateModalTextChange,
        handleRuleUpdateModalMultiSelectChange,
    };

    const RuleModalFooterProps = {
        ruleUpdateModalState,
        handleRuleUpdateModalClose,
        handleRuleUpdateModalSubmit,
    };

    const RuleModalMessageFieldProps = {
        ruleUpdateModalState,
        handleRuleUpdateModalTextChange,
    };

    const labelWidth = 180;

    return (
        <div {...createTestHook(module.id)} className="admission-rule-update-modal">
            <Modal
                onRequestClose={handleRuleUpdateModalClose}
                open={admissionModalOpen}
                style={{ width: '500px' }}
                enablePeek
            >
                <Modal.Body>
                    <Modal.Header
                        title={ruleUpdateModalState.title}
                        onRequestClose={handleRuleUpdateModalClose}
                    />
                    {ruleUpdateModalState.backendErrorMsg ?
                        <Message fill type="error">
                            {ruleUpdateModalState.backendErrorMsg}
                        </Message> : null
                    }
                    <P />
                    {ruleUpdateModalState.edit ?
                        null :
                        <ControlGroup
                            labelWidth={labelWidth}
                            label={_('Name').t()}
                            data-test-name="AdmissionRuleUpdateName"
                            tooltip={_('Name of admission rule').t()}
                            help={ruleUpdateModalState.nameErrorMsg}
                            error={ruleUpdateModalState.nameError}
                        >
                            <Text
                                disabled={ruleUpdateModalState.wait}
                                error={ruleUpdateModalState.nameError}
                                value={ruleUpdateModalState.name}
                                name="name"
                                onChange={handleRuleUpdateModalTextChange}
                                autoComplete={false}
                            />
                        </ControlGroup>
                    }
                    <ControlGroup
                        labelWidth={labelWidth}
                        label={_('Predicate (Condition)').t()}
                        data-test-name="AdmissionRuleUpdatePredicate"
                        tooltip={_(`Specify a condition for this rule. 
                            The format is <type>=<value> with optional AND, OR, NOT, (). 
                            Valid <type> are app, role, user, index, search_type, 
                            search_mode, search_time_range.`).t()}
                        error={ruleUpdateModalState.predicateError}
                        help={ruleUpdateModalState.predicateErrorMsg || _('e.g. index=security AND role=admin').t()}
                    >
                        <Text
                            multiline
                            rows={4}
                            disabled={ruleUpdateModalState.wait}
                            value={ruleUpdateModalState.predicate}
                            name="predicate"
                            onChange={handleRuleUpdateModalTextChange}
                            autoComplete={false}
                        />
                    </ControlGroup>

                    <RuleModalScheduleField {...RuleModalScheduleFieldProps} />

                    <ControlGroup
                        labelWidth={labelWidth}
                        label={_('Action').t()}
                        data-test-name="AdmissionRuleUpdateAction"
                        error={ruleUpdateModalState.actionError}
                        help={ruleUpdateModalState.actionErrorMsg}
                    >
                        <Select
                            disabled={ruleUpdateModalState.wait}
                            value={ruleUpdateModalState.action || ''}
                            name="action"
                            onChange={handleRuleUpdateModalTextChange}
                        >
                            {ruleUpdateModalState.getAdmissionActions.map(action => (
                                <Select.Option
                                    key={action.id}
                                    label={action.label}
                                    value={action.value}
                                />
                            ))}
                        </Select>
                    </ControlGroup>

                    <RuleModalMessageField {...RuleModalMessageFieldProps} />

                </Modal.Body>

                <RuleModalFooter {...RuleModalFooterProps} />

            </Modal>
        </div>
    );
};

AdmissionRuleModal.propTypes = {
    admissionModalOpen: PropTypes.bool,
    ruleUpdateModalState: PropTypes.shape({}).isRequired,
    handleRuleUpdateModalClose: PropTypes.func.isRequired,
    handleRuleUpdateModalTextChange: PropTypes.func.isRequired,
    handleRuleUpdateModalMultiSelectChange: PropTypes.func.isRequired,
    handleRuleUpdateModalSubmit: PropTypes.func.isRequired,
};

AdmissionRuleModal.defaultProps = {
    admissionModalOpen: false,
};

export default AdmissionRuleModal;
