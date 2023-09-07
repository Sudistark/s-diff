/**
 *
 * Policy Collection for Admission Control
 */
import _ from 'underscore';
import SplunkDsBaseCollection from 'collections/SplunkDsBase';
import generalUtils from 'util/general_utils';

export default SplunkDsBaseCollection.extend({
    url: 'workloads/policy',
    isEnabled() {
        if (_.isUndefined(this.models[0])) {
            return false;
        }
        return generalUtils.normalizeBoolean(this.models[0].entry.content.get('admission_rules_enabled'));
    },
});

