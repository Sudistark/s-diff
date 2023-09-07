define([
    'jquery',
    'underscore',
    'module',
    'models/services/server/Health',
    'models/services/server/DistributedHealth',
    'views/Base',
    'views/shared/Icon',
    'views/shared/splunkbar/healthmodal/Master',
    'views/shared/splunkbar/health/health_utils',
    './Master.pcssm',
    'util/keyboard',
    'models/services/server/DistributedHealthDetails'
],
function(
    $,
    _,
    module,
    HealthModel,
    DistributedHealthModel,
    BaseView,
    IconView,
    HealthModal,
    HealthUtils,
    css,
    keyboard,
    DistributedHealthDetailsModel
) {
    return BaseView.extend({
        moduleId: module.id,
        css: css,
        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
            this.HEALTH_POLLING_DELAY = 10000;
            this.deferreds = {};
            this.deferreds.health = $.Deferred();
            this.distributedHealthDetails = new DistributedHealthDetailsModel();
            this.distributedHealthDetails.set({id: 'details'});
            this.distributedHealthDetails.fetch().done(function() {
                this.model.health = this.distributedHealthDetails.isDisabled() ? new HealthModel() : new DistributedHealthModel();
                this.restartHealthPolling();
                this.model.health.on('serverValidated', function() {
                    this.deferreds.health.resolve();
                    this.debouncedRender();
                }.bind(this));
            }.bind(this));
        },

        restartHealthPolling: function() {
            this.model.health.stopPolling();
            this.model.health.startPolling({
                delay: this.HEALTH_POLLING_DELAY,
                uiInactivity: true,
                stopOnError: false,
                data: {}
            });
        },

        events: {
            'click a': function(e) {
                e.preventDefault();
                this.showHealthModal();
            },
            'keyup': function(e) {
                e.preventDefault();
                if (e.which === keyboard.KEYS.ENTER ) {
                    this.showHealthModal();
                }
            },
            'keydown': function(e) {
                if (e.which === keyboard.KEYS.TAB && this.isFocused) {
                    this.isFocused = false;
                }
            },
            'focus a': function(e) {
                e.preventDefault();
                this.isFocused = true;
            },
            'blur a': function(e) {
                if (!this.skipBlur) {
                    e.preventDefault();
                    this.isFocused = false;
                }
            }
        },

        showHealthModal: function() {
            this.children.infoDialog = new HealthModal({
                model: {
                    application: this.model.application,
                    serverInfo: this.model.serverInfo,
                    user: this.model.user
                },
                onHiddenRemove: true
            });
            this.children.infoDialog.render().appendTo($("body"));
            this.children.infoDialog.show();
        },

        render: function() {
            this.deferreds.health.done(function(){
                var health = this.model.health.getHealth();
                var isDisabled = this.model.health.isDisabled();

                var html = this.compiledTemplate({
                    cssBadge: css.healthBadge,
                    iconAltText: HealthUtils.getIconAltText(health, isDisabled)
                });

                // skip blur during re-rendering if element is currently focused
                this.skipBlur = this.isFocused;
                this.$el.html(html);
                this.skipBlur = false;

                var iconName = HealthUtils.getIconName(health, isDisabled);
                var iconStyle = HealthUtils.getIconStyle(health, isDisabled);
                if (this.children.infoIcon) {
                    this.children.infoIcon.$el.detach();
                }
                this.children.infoIcon = new IconView({icon: iconName, size: 1.5});
                this.children.infoIcon.render().appendTo(this.$('[data-role=health-icon]'));
                this.$('[data-role=health-icon]').attr('class', iconStyle);

                if (this.isFocused) {
                    this.el.children[0].focus();
                }
            }.bind(this));
        },
        template: '\
        <a class="<%- cssBadge %>" data-test="health-badge" tabindex="0" title="<%- iconAltText %>" aria-label="<%- iconAltText %>">\
            <span data-role="health-icon"></span>\
        </a>\
        '
    });
});
