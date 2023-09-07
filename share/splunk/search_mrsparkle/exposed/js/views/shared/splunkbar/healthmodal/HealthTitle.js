define([
    'jquery',
    'underscore',
    'module',
    'views/Base',
    './HealthTitle.pcssm',
    'models/services/server/DistributedHealthDetails'
],
function(
    $,
    _,
    module,
    BaseView,
    css,
    DistributedHealthDetailsModel
){
    return BaseView.extend({
        moduleId: module.id,
        css: css,
        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
            this.model = {};
            this.model.distributedHealthDetails = new DistributedHealthDetailsModel();
            this.model.distributedHealthDetails.set({id: 'details'});
            this.deferreds = {};
            this.deferreds.distributedHealthDetails = this.model.distributedHealthDetails.fetch();
        },

        render: function() {
            $.when(
                this.deferreds.distributedHealthDetails
            ).done(function() {
                var html = this.compiledTemplate({
                    css: css,
                    isDistributedDisabled: this.model.distributedHealthDetails.isDisabled()
                });
                this.$el.html(html);
                return this;
            }.bind(this));
        },
        template: '\
            <% if (isDistributedDisabled) { %>\
                <span class="<%- css.healthTitle %>" data-title-role="health-title">\
                    <%- _("Health Status of Splunkd").t() %>\
                </span>\
            <% } %>\
            <% if (!isDistributedDisabled) { %>\
                <span class="<%- css.healthTitle %>" data-title-role="health-title">\
                    <%- _("Health of Splunk Deployment").t() %>\
                </span>\
            <% } %>\
        '
    });
});
