import $ from 'jquery';
import SplunkDBaseModel from 'models/SplunkDBase';
import Backbone from 'backbone';
import splunkdUtils from 'util/splunkd_utils';

export default SplunkDBaseModel.extend({
    url: splunkdUtils.fullpath('workloads/policy/search_admission_control'),
    sync(method, model, options) {
        const defaults = {};

        defaults.data = {
            output_mode: 'json',
        };
        defaults.processData = true;
        if (model.has('admission_rules_enabled')) {
            defaults.data.admission_rules_enabled = model.get('admission_rules_enabled');
        }
        $.extend(true, defaults, options);

        return Backbone.sync.call(null, method, model, defaults);
    },
    enable() {
        this.set({ admission_rules_enabled: 1 });
        return this.save(null, { type: 'POST' });
    },
    disable() {
        this.set({ admission_rules_enabled: 0 });
        return this.save(null, { type: 'POST' });
    },
});
