import _ from 'underscore';
import SplunkDBaseModel from 'models/SplunkDBase';
import splunkdUtils from 'util/splunkd_utils';

export default SplunkDBaseModel.extend({
    urlRoot: 'services/workloads/rules',
    url: 'workloads/rules',
    sync(method, model) {
        const defaults = {};
        defaults.data = {};
        if (method === 'delete') {
            if (model.entry.content.get('workload_rule_type') === 'search_filter') {
                defaults.url = `${splunkdUtils.fullpath(
                model.id, {})}?output_mode=json&workload_rule_type=search_filter`;
            }
        }
        if (method === 'update') {
            if (model.entry.content.get('workload_rule_type') === 'search_filter') {
                defaults.data.workload_rule_type = 'search_filter';
            }
        }
        return SplunkDBaseModel.prototype.sync.call(this, method, model, defaults);
    },
    getOrder() {
        return this.entry.content.get('order') || 0;
    },
    getRuleName() {
        return this.entry.get('name');
    },
    getPredicate() {
        return this.entry.content.get('predicate') || null;
    },
    getUserMessage() {
        return this.entry.content.get('user_message') || null;
    },
    getSchedule() {
        return this.entry.content.get('schedule') || '';
    },
    getScheduleLabel() {
        const content = this.entry.content.get('schedule') || null;
        if (content) {
            const scheduleSplit = content.split('_');
            return `${scheduleSplit[0].charAt(0).toUpperCase()}${scheduleSplit[0].slice(1)}
            ${scheduleSplit[1].charAt(0).toUpperCase()}${scheduleSplit[1].slice(1)}`;
        }
        return _('Always On').t();
    },
    getStartTime() {
        return this.entry.content.get('start_time') || '0:00';
    },
    getEndTime() {
        return this.entry.content.get('end_time') || '0:00';
    },
    getStartDate() {
        return this.entry.content.get('start_date') || new Date().toISOString().substring(0, 10);
    },
    getEndDate() {
        return this.entry.content.get('end_date') || new Date().toISOString().substring(0, 10);
    },
    getTimeRange() {
        if (!this.entry.content.get('schedule')) return '';
        return `${this.getStartDate()} (${this.getStartTime()}) - ${this.getEndDate()} (${this.getEndTime()})`;
    },
    getEveryDay() {
        if (!this.entry.content.get('schedule')) return '';
        return `(${this.getStartTime()}) - (${this.getEndTime()})`;
    },
    getEveryWeek() {
        if (!this.entry.content.get('schedule')) return '';
        return `${this.getEveryWeekDaysLabel()} (${this.getStartTime()}) - (${this.getEndTime()})`;
    },
    getEveryMonth() {
        if (!this.entry.content.get('schedule')) return '';
        return `${this.getEveryMonthDaysLabel()} (${this.getStartTime()}) - (${this.getEndTime()})`;
    },
    getEveryWeekDays() {
        if (this.entry.content.get('every_week_days')) {
            return this.entry.content.get('every_week_days').split(',');
        }
        return [];
    },
    getEveryWeekDaysLabel() {
        const labels = [];
        _.each(this.getEveryWeekDays(), (day) => {
            switch (day) {
                case '0':
                    labels.push(_('Sun').t());
                    break;
                case '1':
                    labels.push(_('Mon').t());
                    break;
                case '2':
                    labels.push(_('Tues').t());
                    break;
                case '3':
                    labels.push(_('Wed').t());
                    break;
                case '4':
                    labels.push(_('Thurs').t());
                    break;
                case '5':
                    labels.push(_('Fri').t());
                    break;
                case '6':
                    labels.push(_('Sat').t());
                    break;
                default:
                    break;
            }
        });
        return labels.join(', ');
    },
    getEveryMonthDays() {
        if (this.entry.content.get('every_month_days')) {
            return this.entry.content.get('every_month_days').split(',');
        }
        return [];
    },
    getEveryMonthDaysLabel() {
        return this.getEveryMonthDays().join(', ');
    },
    getRuleActionLabel(ruleUpdateModalState) {
        const action = this.entry.content.get('action');
        if (action === 'filter') {
            return _('Filter search').t();
        }
        if (_.isEmpty(action)) return `${_('Place search in a Pool: ').t()} ${this.entry.content.get('workload_pool')}`;
        let label = '';
        _.each(ruleUpdateModalState.getRuleActions, (rule) => {
            if (rule.value === action) {
                label = rule.label;
                if (rule.value === 'move') label += `: ${this.entry.content.get('workload_pool')}`;
            }
        });
        return label;
    },
    getAction() {
        return this.entry.content.get('action') || null;
    },
    getWorkloadPool() {
        return this.entry.content.get('workload_pool') || null;
    },
    isApplied() {
        return this.get('isApplied');
    },
});
