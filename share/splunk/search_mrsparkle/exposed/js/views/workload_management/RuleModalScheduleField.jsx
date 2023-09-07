import _ from 'underscore';
import { createTestHook } from 'util/test_support';
import React from 'react';
import PropTypes from 'prop-types';
import ControlGroup from '@splunk/react-ui/ControlGroup';
import Select from '@splunk/react-ui/Select';
import Date from '@splunk/react-ui/Date';
import Multiselect from '@splunk/react-ui/Multiselect';

const RuleScheduleField = (props) => {
    const {
        ruleUpdateModalState,
        handleRuleUpdateModalTextChange,
        handleRuleUpdateModalMultiSelectChange,
    } = props;

    const labelWidth = 180;

    return (
        <div {...createTestHook(module.id)} className="rule-modal-schedule-field">
            <ControlGroup
                labelWidth={labelWidth}
                label={_('Schedule').t()}
                data-test-name="RuleUpdateSchedule"
                tooltip={_('Set the time interval during which this rule is valid.').t()}
            >
                <Select
                    disabled={ruleUpdateModalState.wait}
                    value={ruleUpdateModalState.schedule}
                    name="schedule"
                    onChange={handleRuleUpdateModalTextChange}
                >
                    <Select.Option
                        key={'always_on'}
                        label={_('Always On').t()}
                        value={''}
                        data-test-value="always_on"
                    />
                    <Select.Option
                        key={'time_range'}
                        label={_('Time Range').t()}
                        value={'time_range'}
                    />
                    <Select.Option
                        key={'every_day'}
                        label={_('Every Day').t()}
                        value={'every_day'}
                    />
                    <Select.Option
                        key={'every_week'}
                        label={_('Every Week').t()}
                        value={'every_week'}
                    />
                    <Select.Option
                        key={'every_month'}
                        label={_('Every Month').t()}
                        value={'every_month'}
                    />
                </Select>
            </ControlGroup>

            {ruleUpdateModalState.schedule === 'time_range' && (
                <ControlGroup
                    labelWidth={labelWidth}
                    label={_('From').t()}
                    data-test-name="RuleUpdateTimeStart"
                >
                    <Date
                        inline
                        disabled={ruleUpdateModalState.wait}
                        name={'start_date'}
                        value={ruleUpdateModalState.start_date}
                        onChange={handleRuleUpdateModalTextChange}
                        data-test-name="calendar"
                    />
                    <Select
                        disabled={ruleUpdateModalState.wait}
                        value={ruleUpdateModalState.start_time}
                        name="start_time"
                        onChange={handleRuleUpdateModalTextChange}
                    >
                        {ruleUpdateModalState.timeItems.map(row => (
                            <Select.Option
                                key={`'time_range_start_time' ${row}`}
                                label={row}
                                value={row}
                            />
                        ))}
                    </Select>
                </ControlGroup>
            )}
            {ruleUpdateModalState.schedule === 'time_range' && (
                <ControlGroup
                    labelWidth={labelWidth}
                    label={_('To').t()}
                    data-test-name="RuleUpdateTimeEnd"
                >
                    <Date
                        inline
                        disabled={ruleUpdateModalState.wait}
                        name={'end_date'}
                        value={ruleUpdateModalState.end_date}
                        onChange={handleRuleUpdateModalTextChange}
                        data-test-name="calendar"
                    />
                    <Select
                        disabled={ruleUpdateModalState.wait}
                        value={ruleUpdateModalState.end_time}
                        name="end_time"
                        onChange={handleRuleUpdateModalTextChange}
                    >
                        {ruleUpdateModalState.timeItems.map(row => (
                            <Select.Option
                                key={`'time_range_end_time' ${row}`}
                                label={row}
                                value={row}
                            />
                        ))}
                    </Select>
                </ControlGroup>
            )}
            {ruleUpdateModalState.schedule === 'every_day' && (
                <ControlGroup
                    labelWidth={labelWidth}
                    label={_('From').t()}
                    data-test-name="RuleUpdateEveryDayTimeStart"
                >
                    <Select
                        disabled={ruleUpdateModalState.wait}
                        value={ruleUpdateModalState.start_time}
                        name="start_time"
                        onChange={handleRuleUpdateModalTextChange}
                    >
                        {ruleUpdateModalState.timeItems.map(row => (
                            <Select.Option
                                key={`'every_day_start_time' ${row}`}
                                label={row}
                                value={row}
                            />
                        ))}
                    </Select>
                </ControlGroup>
            )}
            {ruleUpdateModalState.schedule === 'every_day' && (
                <ControlGroup
                    labelWidth={labelWidth}
                    label={_('To').t()}
                    data-test-name="RuleUpdateEveryDayTimeEnd"
                >
                    <Select
                        disabled={ruleUpdateModalState.wait}
                        value={ruleUpdateModalState.end_time}
                        name="end_time"
                        onChange={handleRuleUpdateModalTextChange}
                    >
                        {ruleUpdateModalState.timeItems.map(row => (
                            <Select.Option
                                key={`'every_day_end_time' ${row}`}
                                label={row}
                                value={row}
                            />
                        ))}
                    </Select>
                </ControlGroup>
            )}
            {ruleUpdateModalState.schedule === 'every_week' && (
                <ControlGroup
                    labelWidth={labelWidth}
                    label={_('On').t()}
                    data-test-name="RuleUpdateEveryWeekOn"
                >
                    <Multiselect
                        inline
                        compact
                        name="every_week_days"
                        defaultValues={ruleUpdateModalState.every_week_days}
                        onChange={handleRuleUpdateModalMultiSelectChange}
                    >
                        <Multiselect.Option label="Sunday" value="0" name="0" />
                        <Multiselect.Option label="Monday" value="1" name="1" />
                        <Multiselect.Option label="Tuesday" value="2" name="2" />
                        <Multiselect.Option label="Wednesday" value="3" name="3" />
                        <Multiselect.Option label="Thursday" value="4" name="4" />
                        <Multiselect.Option label="Friday" value="5" name="5" />
                        <Multiselect.Option label="Saturday" value="6" name="6" />
                    </Multiselect>
                </ControlGroup>
            )}
            {ruleUpdateModalState.schedule === 'every_week' && (
                <ControlGroup
                    labelWidth={labelWidth}
                    label={_('From').t()}
                    data-test-name="RuleUpdateEveryWeekTimeStart"
                >
                    <Select
                        disabled={ruleUpdateModalState.wait}
                        value={ruleUpdateModalState.start_time}
                        name="start_time"
                        onChange={handleRuleUpdateModalTextChange}
                    >
                        {ruleUpdateModalState.timeItems.map(row => (
                            <Select.Option
                                key={`'every_week_start_time' ${row}`}
                                label={row}
                                value={row}
                            />
                        ))}
                    </Select>
                </ControlGroup>
            )}
            {ruleUpdateModalState.schedule === 'every_week' && (
                <ControlGroup
                    labelWidth={labelWidth}
                    label={_('To').t()}
                    data-test-name="RuleUpdateEveryWeekTimeEnd"
                >
                    <Select
                        disabled={ruleUpdateModalState.wait}
                        value={ruleUpdateModalState.end_time}
                        name="end_time"
                        onChange={handleRuleUpdateModalTextChange}
                    >
                        {ruleUpdateModalState.timeItems.map(row => (
                            <Select.Option
                                key={`'every_week_end_time' ${row}`}
                                label={row}
                                value={row}
                            />
                        ))}
                    </Select>
                </ControlGroup>
            )}

            {ruleUpdateModalState.schedule === 'every_month' && (
                <ControlGroup
                    labelWidth={labelWidth}
                    label={_('On day').t()}
                    data-test-name="RuleUpdateEveryMonthOnDay"
                >
                    <Multiselect
                        inline
                        compact
                        name="every_month_days"
                        defaultValues={ruleUpdateModalState.every_month_days}
                        onChange={handleRuleUpdateModalMultiSelectChange}
                    >
                        {_.range(1, 32).map(row => (
                            <Multiselect.Option
                                key={row}
                                label={row.toString()}
                                value={row.toString()}
                                name={row.toString()}
                            />
                        ))}
                    </Multiselect>
                </ControlGroup>
            )}
            {ruleUpdateModalState.schedule === 'every_month' && (
                <ControlGroup
                    labelWidth={labelWidth}
                    label={_('From').t()}
                    data-test-name="RuleUpdateEveryMonthTimeStart"
                >
                    <Select
                        disabled={ruleUpdateModalState.wait}
                        value={ruleUpdateModalState.start_time}
                        name="start_time"
                        onChange={handleRuleUpdateModalTextChange}
                    >
                        {ruleUpdateModalState.timeItems.map(row => (
                            <Select.Option
                                key={`'every_month_start_time' ${row}`}
                                label={row}
                                value={row}
                            />
                        ))}
                    </Select>
                </ControlGroup>
            )}
            {ruleUpdateModalState.schedule === 'every_month' && (
                <ControlGroup
                    labelWidth={labelWidth}
                    label={_('To').t()}
                    data-test-name="RuleUpdateEveryMonthTimeEnd"
                >
                    <Select
                        disabled={ruleUpdateModalState.wait}
                        value={ruleUpdateModalState.end_time}
                        name="end_time"
                        onChange={handleRuleUpdateModalTextChange}
                    >
                        {ruleUpdateModalState.timeItems.map(row => (
                            <Select.Option
                                key={`'every_month_end_time' ${row}`}
                                label={row}
                                value={row}
                            />
                        ))}
                    </Select>
                </ControlGroup>
            )}
        </div>
    );
};

RuleScheduleField.propTypes = {
    ruleUpdateModalState: PropTypes.shape({}).isRequired,
    handleRuleUpdateModalTextChange: PropTypes.func.isRequired,
    handleRuleUpdateModalMultiSelectChange: PropTypes.func.isRequired,
};

RuleScheduleField.defaultProps = {
    ruleUpdateModalOpen: false,
};

export default RuleScheduleField;
