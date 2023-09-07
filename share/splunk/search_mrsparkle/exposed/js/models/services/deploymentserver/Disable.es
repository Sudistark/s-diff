import $ from 'jquery';
import Backbone from 'backbone';
import SplunkDBaseModel from 'models/SplunkDBase';
import splunkdUtils from 'util/splunkd_utils';

export default SplunkDBaseModel.extend({
    url: splunkdUtils.fullpath('deployment/server/config/config/disable'),
    sync(method, model, options) {
        const defaults = {};

        defaults.data = {
            output_mode: 'json',
        };
        defaults.processData = true;
        $.extend(true, defaults, options);

        return Backbone.sync.call(null, method, model, defaults);
    },
});
