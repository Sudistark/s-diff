import _ from 'underscore';
import { createTestHook } from 'util/test_support';
import React from 'react';
import PropTypes from 'prop-types';
import Table from '@splunk/react-ui/Table';
import Button from '@splunk/react-ui/Button';
import Heading from '@splunk/react-ui/Heading';
import css from './WorkloadManagement.pcssm';

const RulesTable = React.memo((props) => {
    const {
        admissionRules,
        ruleUpdateModalState,
        canEditWorkloadRules,
        handleRuleUpdateModalOpenEdit,
        handleRuleDeleteModalOpen,
    } = props;

    return (
        <div {...createTestHook(module.id)} className={css.table}>
            <Heading level={2}>{_('Admission Rules').t()}</Heading>
            <Table stripeRows>
                <Table.Head>
                    <Table.HeadCell>{_('Admission Rule').t()}</Table.HeadCell>
                    <Table.HeadCell>{_('Predicate (Condition)').t()}</Table.HeadCell>
                    <Table.HeadCell>{_('Rule Action').t()}</Table.HeadCell>
                    <Table.HeadCell>{_('User Message').t()}</Table.HeadCell>
                    <Table.HeadCell>{_('Schedule').t()}</Table.HeadCell>
                    { canEditWorkloadRules ? <Table.HeadCell align="center">{_('Actions').t()}</Table.HeadCell> : null }
                </Table.Head>
                <Table.Body>
                    {admissionRules.map(row => (
                        <Table.Row key={row.id}>
                            <Table.Cell>{row.getRuleName()}</Table.Cell>
                            <Table.Cell>{row.getPredicate()}</Table.Cell>
                            <Table.Cell>{row.getRuleActionLabel(ruleUpdateModalState)}</Table.Cell>
                            <Table.Cell>{row.getUserMessage()}</Table.Cell>
                            <Table.Cell>
                                <div>{row.getScheduleLabel()}</div>
                                {
                                    row.getSchedule() === 'time_range' ?
                                        <div>{row.getTimeRange()}</div>
                                        : null
                                }
                                {
                                    row.getSchedule() === 'every_day' ?
                                        <div>{row.getEveryDay()}</div>
                                        : null
                                }
                                {
                                    row.getSchedule() === 'every_week' ?
                                        <div>{row.getEveryWeek()}</div>
                                        : null
                                }
                                {
                                    row.getSchedule() === 'every_month' ?
                                        <div>{row.getEveryMonth()}</div>
                                        : null
                                }
                            </Table.Cell>
                            { canEditWorkloadRules ?
                                <Table.Cell align="center">
                                    <Button
                                        data-test-name="Edit"
                                        label={_('Edit').t()}
                                        appearance="pill"
                                        value={row}
                                        size="small"
                                        classNamePrivate={css.link}
                                        onClick={handleRuleUpdateModalOpenEdit}
                                    />
                                    <Button
                                        data-test-name="Delete"
                                        label={_('Delete').t()}
                                        appearance="pill"
                                        value={row}
                                        size="small"
                                        classNamePrivate={css.link}
                                        onClick={handleRuleDeleteModalOpen}
                                    />
                                </Table.Cell> : null
                            }
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table>
        </div>
    );
});


RulesTable.propTypes = {
    admissionRules: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    ruleUpdateModalState: PropTypes.shape({}).isRequired,
    canEditWorkloadRules: PropTypes.bool.isRequired,
    handleRuleUpdateModalOpenEdit: PropTypes.func.isRequired,
    handleRuleDeleteModalOpen: PropTypes.func.isRequired,
};

export default RulesTable;
