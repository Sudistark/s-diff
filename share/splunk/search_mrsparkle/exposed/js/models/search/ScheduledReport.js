define(
    [
        'underscore',
        'jquery',
        'models/search/Report',
        'models/shared/Cron',
        'models/shared/TimeRange',
        'util/validation',
        'splunk.util'
    ],
    function(
        _,
        $,
        ReportModel,
        CronModel,
        TimeRangeModel,
        ValidationUtils,
        splunkUtil
    ) {
        var ScheduledReportModel = ReportModel.extend({
            initialize: function() {
                ReportModel.prototype.initialize.apply(this, arguments);
            },

            initializeAssociated: function() {
                ReportModel.prototype.initializeAssociated.apply(this, arguments);
                var RootClass = this.constructor;
                this.associated = this.associated || {};

                this.cron = this.cron || new RootClass.Cron();
                this.associated.cron = this.cron;

                this.workingTimeRange = this.workingTimeRange || new RootClass.WorkingTimeRange({enableRealTime:false});
                this.associated.workingTimeRange = this.workingTimeRange;
            },

            setFromSplunkD: function(payload, options) {
                ReportModel.prototype.setFromSplunkD.apply(this, arguments);
                this.transposeFromSavedsearch();
            },

            parse: function(response) {
                var parsedResponse = ReportModel.prototype.parse.apply(this, arguments);
                this.transposeFromSavedsearch();
                return parsedResponse;
            },

            sync: function(method, model, options) {
                options = $.extend(true, {}, options || {});
                if (method === 'create' || method === 'update') {

                    // transposeToSavedsearch is called below and sets values on the entry content
                    // save the original values to set back on the mode if there is an error.
                    var cloneContent = model.entry.content.clone().toJSON(),
                        error = options.error;

                    options.error = function () {
                        model.entry.content.set(cloneContent);
                        if (error) {
                            error.apply(this, arguments);
                        }
                    };

                    this.transposeToSavedsearch();
                }

                return ReportModel.prototype.sync.apply(this, arguments);
            },

            validate: function(attrs, setOptions) {
                var errors = _.extend({}, ReportModel.prototype.validate.apply(this, arguments), this.entry.content.validate());

                if (this.get('scheduled_and_enabled')) {
                    _.extend(errors, this.cron.validate());
                } else {
                    this.cron.clearErrors();
                }

                if (_.isEmpty(errors)) {
                    return undefined;
                } else {
                    return errors;
                }
            },

            transposeToSavedsearch: function() {
                if (this.get('scheduled_and_enabled')) {
                    // SPL-109045: Set dispatchAs to owner if report is scheduled.
                    var baseAttrs = {
                        'is_scheduled': 1,
                        'disabled': 0,
                        'cron_schedule': this.cron.getCronString(),
                        'dispatchAs': 'owner'
                    };
                    var timeAttrs = this.entry.content.get('durable.track_time_type') === '_indextime' ? {
                        'dispatch.index_earliest': this.workingTimeRange.get('earliest'),
                        'dispatch.index_latest':this.workingTimeRange.get('latest')
                    } : {
                        'dispatch.earliest_time': this.workingTimeRange.get('earliest'),
                        'dispatch.latest_time':this.workingTimeRange.get('latest')
                    };
                    var mergedAttrs = Object.assign({}, baseAttrs, timeAttrs);
                    this.entry.content.set(mergedAttrs);

                    this.transposeActionsToSavedsearch();

                } else {
                    this.entry.content.set('is_scheduled', 0);
                }
            },

            transposeActionsToSavedsearch: function() {
                if (this.entry.content.get('action.email')) {
                    var sendResults = splunkUtil.normalizeBoolean(this.entry.content.get('action.email.sendpdf')) ||
                            splunkUtil.normalizeBoolean(this.entry.content.get('action.email.sendcsv')) ||
                            splunkUtil.normalizeBoolean(this.entry.content.get('action.email.inline'));
                    this.entry.content.set('action.email.sendresults', sendResults ? 1 : 0);
                }

                var actions = [];

                _.each(this.entry.content.attributes, function(value, attr) {
                    if (value == true) {
                        var actionName = attr.match(/^action.([^\.]*)$/);
                        if (actionName) {
                            actions.push(actionName[1]);
                        }
                    }
                });

                this.entry.content.set('actions', actions.join(', '));
            },

            transposeFromSavedsearch: function() {
                this.set({
                    scheduled_and_enabled: !this.entry.content.get('disabled') && this.entry.content.get('is_scheduled')
                });
                this.cron.setFromCronString(this.entry.content.get('cron_schedule') || '0 6 * * 1');

                if (this.entry.content.get('durable.track_time_type') === '_indextime') {
                    this.workingTimeRange.save({
                        'earliest': this.entry.content.get('dispatch.index_earliest'),
                        'latest': this.entry.content.get('dispatch.index_latest')
                    });
                } else {
                    this.workingTimeRange.save({
                        'earliest': this.entry.content.get('dispatch.earliest_time'),
                        'latest': this.entry.content.get('dispatch.latest_time')
                    });
                }
            },
            unsetUnselectedActionArgs: function () {
                var removedAttr = {};
                _.each(this.entry.content.attributes, function(value, attr) {
                    var match = attr.match(/^action.([^\.]*)\./);
                    if (match && !this.entry.content.get('action.' + match[1])) {
                        removedAttr[attr] = value;
                        this.entry.content.unset(attr);
                    }
                }.bind(this));
                return removedAttr;
            }
        },
        {
            Cron: CronModel,
            WorkingTimeRange: TimeRangeModel
        });

        // break the shared reference to Entry
        ScheduledReportModel.Entry = ScheduledReportModel.Entry.extend({});
        // now we can safely extend Entry.Content
        ScheduledReportModel.Entry.Content = ScheduledReportModel.Entry.Content.extend({
            validation: {
                'action.script.filename': {
                    fn: 'validateScriptFilename'
                },
                'action.email.to': {
                    fn: 'validateEmailTo'
                },
                'action.email.cc': {
                    fn: 'validateEmailCc'
                },
                'action.email.bcc': {
                    fn: 'validateEmailCc'
                },
                'action.lookup.filename': {
                    fn: 'validateLookupFilename'
                }
            },
            validateScriptFilename: function(value, attr, computedState) {
                if (computedState['action.script']) {
                    if (_.isUndefined(value) || $.trim(value).length === 0) {
                        return _('A file name is required if script action is enabled').t();
                    }

                    if (!ValidationUtils.isValidFilename(value)) {
                       return _("Script file name cannot contain '..', '/', or '\\'").t();
                    }
                }
            },
            validateEmailTo: function(value, attr, computedState) {
                 if (computedState['action.email']) {
                    if (_.isUndefined(value) || $.trim(value).length === 0) {
                        return _('An email address is required if email action is enabled').t();
                    }

                    if (!ValidationUtils.isValidEmailList(value)) {
                        return _('One of the email addresses is invalid').t();
                    }

                    if ($.trim(computedState['action.email.allowedDomainList']).length > 0) {
                        var allowedDomains = $.trim(computedState['action.email.allowedDomainList']).split(',');
                        var toEmailDomain = value.split('@')[1];

                        if (!_.contains(allowedDomains, toEmailDomain)) {
                            return _('This email domain is not approved. To resolve this issue, contact your Splunk Administrator.').t();
                        }
                    }
                 }
            },
            validateEmailCc: function(value, attr, computedState) {
                if (computedState['action.email']) {
                    if (_.isUndefined(value) || $.trim(value).length === 0) {
                        return;
                    }

                    if (!ValidationUtils.isValidEmailList(value)) {
                        return _('One of the email addresses is invalid').t();
                    }

                    if ($.trim(computedState['action.email.allowedDomainList']).length > 0) {
                        var allowedDomains = $.trim(computedState['action.email.allowedDomainList']).split(',');
                        var ccEmailDomain = value.split('@')[1];

                        if (!_.contains(allowedDomains, ccEmailDomain)) {
                            return _('This email domain is not approved. To resolve this issue, contact your Splunk Administrator.').t();
                        }
                    }
                }
            },
            validateLookupFilename: function(value, attr, computedState) {
                if (splunkUtil.normalizeBoolean(computedState['action.lookup'])) {
                    if ((_.isUndefined(value) || $.trim(value).length === 0)) {
                        return _('A file name is required if lookup action is enabled').t();
                    }
                    if (!/.*\.csv$/.test(value) || !ValidationUtils.isValidFilename(value)) {
                        return _("Lookup file name must end with .csv and cannot contain '..', '/', or '\\'").t();
                    }
                }
            }
        });
        return ScheduledReportModel;
    }
);
