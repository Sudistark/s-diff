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
import RuleModalMessageField from './RuleModalMessageField';
import RuleModalFooter from './RuleModalFooter';

const RuleUpdateModal = (props) => {
    const {
        ruleUpdateModalOpen,
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

    const RuleModalMessageFieldProps = {
        ruleUpdateModalState,
        handleRuleUpdateModalTextChange,
    };

    const RuleModalFooterProps = {
        ruleUpdateModalState,
        handleRuleUpdateModalClose,
        handleRuleUpdateModalSubmit,
    };

    const labelWidth = 180;

    return (
        <div {...createTestHook(module.id)} className="workload-rule-update-modal">
            <Modal
                onRequestClose={handleRuleUpdateModalClose}
                open={ruleUpdateModalOpen}
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
                    { ruleUpdateModalState.edit ?
                        <ControlGroup
                            labelWidth={labelWidth}
                            label={_('Order').t()}
                            data-test-name="RuleUpdateOrder"
                            tooltip={_('Order of workload rule').t()}
                            help={ruleUpdateModalState.orderErrorMsg}
                            error={ruleUpdateModalState.orderError}
                        >
                            <Text
                                disabled={ruleUpdateModalState.wait}
                                error={ruleUpdateModalState.orderError}
                                value={ruleUpdateModalState.order}
                                name="order"
                                onChange={handleRuleUpdateModalTextChange}
                                autoComplete={false}
                            />
                        </ControlGroup> :
                        <ControlGroup
                            labelWidth={labelWidth}
                            label={_('Name').t()}
                            data-test-name="RuleUpdateName"
                            tooltip={_('Name of workload rule').t()}
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
                        data-test-name="RuleUpdatePredicate"
                        tooltip={_(`Specify a condition for this rule. 
                            The format is <type>=<value> with optional AND, OR, NOT, (). 
                            Valid <type> are app, role, user, index, search_type, 
                            search_mode, search_time_range, and runtime.`).t()}
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
                        data-test-name="RuleUpdateWLAction"
                        tooltip={_(`Move, Abort and Message actions only apply to in-progress searches. 
                            Include "runtime" condition to enable these actions. 
                            e.g. index=_internal AND runtime>1m`).t()}
                        error={ruleUpdateModalState.actionError}
                        help={ruleUpdateModalState.actionErrorMsg}
                    >
                        <Select
                            disabled={ruleUpdateModalState.wait}
                            value={ruleUpdateModalState.action || ''}
                            name="action"
                            onChange={handleRuleUpdateModalTextChange}
                        >
                            {ruleUpdateModalState.getRuleActions.map(action => (
                                <Select.Option
                                    key={action.id}
                                    label={action.label}
                                    value={action.value}
                                />
                            ))}
                        </Select>
                    </ControlGroup>

                    {(ruleUpdateModalState.action === 'move' || _.isEmpty(ruleUpdateModalState.action)) && (
                        <ControlGroup
                            labelWidth={labelWidth}
                            label={_('Workload Pool').t()}
                            data-test-name="RuleUpdateWLPool"
                            tooltip={_('The workload pool that matches to this rule.').t()}
                            error={ruleUpdateModalState.poolError}
                            help={ruleUpdateModalState.poolErrorMsg}
                        >
                            <Select
                                disabled={ruleUpdateModalState.wait}
                                value={ruleUpdateModalState.workload_pool}
                                name="workload_pool"
                                onChange={handleRuleUpdateModalTextChange}
                            >
                                {ruleUpdateModalState.available_pools.map(option => (
                                    <Select.Option
                                        key={option.id}
                                        label={option.getName()}
                                        value={option.getName()}
                                    />
                                ))}
                            </Select>
                        </ControlGroup>
                    )}

                    <RuleModalMessageField {...RuleModalMessageFieldProps} />

                </Modal.Body>

                <RuleModalFooter {...RuleModalFooterProps} />

            </Modal>
        </div>
    );
};

RuleUpdateModal.propTypes = {
    ruleUpdateModalOpen: PropTypes.bool,
    ruleUpdateModalState: PropTypes.shape({}).isRequired,
    handleRuleUpdateModalClose: PropTypes.func.isRequired,
    handleRuleUpdateModalTextChange: PropTypes.func.isRequired,
    handleRuleUpdateModalMultiSelectChange: PropTypes.func.isRequired,
    handleRuleUpdateModalSubmit: PropTypes.func.isRequired,
};

RuleUpdateModal.defaultProps = {
    ruleUpdateModalOpen: false,
};

export default RuleUpdateModal;
