define([
            'jquery',
            'underscore',
            'splunk.logger',
            'splunk.util'
        ],
        function(
            $,
            _,
            SplunkLogger,
            splunkUtils
        ) {

    var LOG_MODE = splunkUtils.getConfigValue("JS_LOGGER_MODE", "None"),
        LOG_LEVEL = splunkUtils.getConfigValue("JS_LOGGER_LEVEL", "INFO");

    // only need to attach an ajaxPrefilter handler if the logger type and log level indicate it is needed
    if(LOG_MODE !== 'None' && LOG_LEVEL === 'DEBUG') {
        var logger = SplunkLogger.getLogger('ajax_logging.js');

        // disallow-list of AJAX URLs that should not be logged
        var URL_DISALLOW_LIST = [
            SplunkLogger.mode.Server.END_POINT,
            'services/messages'
        ];

        $.ajaxPrefilter(function(options, originalOptions, jqXHR) {
            var passesDisallowList = _(URL_DISALLOW_LIST).every(function(disallowListUrl) {
                return options.url.indexOf(disallowListUrl) === -1;
            });
            if(passesDisallowList) {
                logger.debug('sending AJAX request to ', options.url);
                logger.trace();
            }
        });
    }

});
