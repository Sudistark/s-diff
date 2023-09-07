define(['jquery',
       'jquery.ui.widget',
       'splunk.i18n',
       'imports-loader?jQuery=jquery!jquery-ui/ui/widgets/datepicker'], function(jQuery, widget, i18n) {
    var initFn = i18n.jQuery_ui_datepicker_install;
    if (typeof initFn === 'function') {
        initFn(jQuery);
    }
    return jQuery;
});
