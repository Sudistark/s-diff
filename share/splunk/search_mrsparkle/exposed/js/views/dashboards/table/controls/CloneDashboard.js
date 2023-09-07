define([
    'jquery',
    'underscore',
    'module',
    'views/shared/Modal',
    'views/shared/controls/ControlGroup',
    'models/Base',
    'models/search/Dashboard',
    'views/shared/FlashMessages',
    'util/splunkd_utils',
    'views/dashboards/table/controls/CloneSuccess',
    'views/shared/delegates/PairedTextControls',
    'views/shared/controls/TextControl',
    'util/xml',
    'react',
    'react-dom',
    'controllers/dashboard/helpers/DashboardV2Helper',
    '@splunk/splunk-utils/config',
    '@splunk/splunk-utils/url',
    'uri/route',
    'splunk.util'
    ],

    function (
        $,
        _,
        module,
        Modal,
        ControlGroup,
        BaseModel,
        DashboardModel,
        FlashMessagesView,
        splunkDUtils,
        CloneSuccessView,
        PairedTextControls,
        TextControl,
        XML,
        React,
        ReactDOM,
        DashboardV2Helper,
        splunkUtilsConfig,
        splunkUtilsUrl,
        route,
        splunkUtils
    )
{

    return Modal.extend({
        moduleId: module.id,
        initialize: function () {
            if (this.model.cloneDashboardInStudio) {
                return this;
            }
            Modal.prototype.initialize.apply(this, arguments);

            this.model.perms = new BaseModel({
                'clonePermissions': false
            });

            this.children.flashMessages = new FlashMessagesView({
                model: {
                    dashboard: this.model.dashboard,
                    dashboardMeta: this.model.dashboard.meta
                }
            });

            this.model.dashboard.meta.set({
                label: this.model.dashboard.meta.get('label') + _(' Clone').t()
            });

            var titleTextControlLabel = _("Title").t();
            this.children.titleTextControl = new TextControl({
                modelAttribute: 'label',
                model: this.model.dashboard.meta,
                placeholder: _('optional').t(),
                save: false,
                ariaLabel: titleTextControlLabel
            });

            var filenameTextControlLabel = _("ID").t();
            this.children.filenameTextControl = new TextControl({
                modelAttribute: 'name',
                model: this.model.dashboard.entry.content,
                save: false,
                ariaLabel: filenameTextControlLabel
            });
            this.children.filenameTextControl.setValue(
                splunkDUtils.nameFromString(this.model.dashboard.meta.get('label'))
            );

            this.pairedTextControls = new PairedTextControls({
                sourceDelegate: this.children.titleTextControl,
                destDelegate: this.children.filenameTextControl,
                transformFunction: splunkDUtils.nameFromString
            });

            this.children.title = new ControlGroup({
                controls: this.children.titleTextControl,
                label: titleTextControlLabel
            });

            this.children.filename = new ControlGroup({
                controls: this.children.filenameTextControl,
                label: filenameTextControlLabel,
                help: _("The dashboard ID can only contain letters, numbers, dashes, and underscores. Do not start the dashboard ID with a period.").t(),
                tooltip: _("The ID is used as the filename on disk. Cannot be changed later.").t()
            });

            var descriptionControlLabel = _("New Description").t();
            this.children.description = new ControlGroup({
                controlType: 'Textarea',
                controlOptions: {
                    modelAttribute: 'description',
                    model: this.model.dashboard.meta,
                    placeholder: _("optional").t(),
                    ariaLabel: descriptionControlLabel,
                    save: false
                },
                label: descriptionControlLabel
            });

            this.children.permissions = new ControlGroup({
                controlType: 'SyntheticRadio',
                controlOptions: {
                    additionalClassNames: "btn-group-2",
                    modelAttribute: 'clonePermissions',
                    model: this.model.perms,
                    items: [
                        { label: _("Private").t(), value: false },
                        { label: _("Clone").t(), value: true }
                    ],
                    save: false
                },
                label: _("Permissions").t()
            });

        },
        events: $.extend({}, Modal.prototype.events, {
            'click a.modal-btn-primary': function (e) {
                splunkUtils.trackEvent({
                    type: 'cloneDashboard.interact',
                    data: {
                        action: 'clone'
                    }
                });
                e.preventDefault();
                this.submit();
            },
            'click a.modal-btn-cancel': function () {
                splunkUtils.trackEvent({
                    type: 'cloneDashboard.interact',
                    data: {
                        action: 'cancel'
                    }
                });
            }
        }),
        createSuccess: function() {
            if(this.collection && this.collection.dashboards) {
                this.collection.dashboards.add(this.model.dashboard);
            }

            _.defer(function(){
                var successDialog = new CloneSuccessView({
                    model: {
                        dashboard: this.model.dashboard,
                        application: this.model.application,
                        appLocal: this.model.appLocal,
                        state: this.model.state,
                        user: this.model.user,
                        serverInfo: this.model.serverInfo
                    },
                    collection: this.collection
                });
                successDialog.render().show();
            }.bind(this));

            this.hide();
            this.remove();
        },
        dashboardContainsExternalAssets: function(xml) {
            return XML.root(xml).is('[script],[stylesheet]');
        },
        updateDashboardAssets: function(type, node, assets, app) {
            var updatedAssets = _.map(assets.split(','), function(asset) {
                if (_.indexOf(asset, ':') > -1) {
                    return asset.trim();
                } else {
                    return app + ':' + asset.trim();
                }
            }).join(',');
            node.attr(type, updatedAssets);
        },
        applyAppContextToDashboardXML: function(dashboard, dashboardAppName) {
            var dashboardSource = dashboard.entry.content.get('eai:data');
            var parsedXML = XML.parse(dashboardSource);
            if (parsedXML && this.dashboardContainsExternalAssets(parsedXML)) {
                var rootNode = XML.root(parsedXML);
                var scripts = rootNode.attr('script');
                var stylesheets = rootNode.attr('stylesheet');
                if (scripts || stylesheets) {
                    if (scripts) {
                        this.updateDashboardAssets('script', rootNode, scripts, dashboardAppName);
                    }
                    if (stylesheets) {
                        this.updateDashboardAssets('stylesheet', rootNode, stylesheets, dashboardAppName);
                    }
                    var updatedDashboardXML = XML.serializeDashboardXML(parsedXML, true);
                    dashboard.entry.content.set('eai:data', updatedDashboardXML, {silent:true});
                }
            }
        },
        updateUDFDefinition: function(dashboard) {
            var dashboardSource = dashboard.entry.content.get('eai:data');
            var $parsedXMLDoc = XML.parse(dashboardSource);
            if (!$parsedXMLDoc) {
                return;
            }
            var definition = $parsedXMLDoc.get(0).getElementsByTagName("definition");
            if (!definition || definition.length === 0) {
                return;
            }
            var definitionObject = JSON.parse(definition[0].textContent);
            definitionObject.title = dashboard.meta.get('label');
            definitionObject.description = dashboard.meta.get('description');
            definition[0].textContent = JSON.stringify(definitionObject);
            var updatedDashboardXML = XML.serialize($parsedXMLDoc);
            dashboard.entry.content.set('eai:data', updatedDashboardXML, {silent:true});
        },
        submit: function() {
            var dashboard = this.model.dashboard;
            var dashboardAppName = this.model.acl.get('app');
            var dashboardVersion = this.model.dashboard.meta.get("version");
            if (dashboardAppName && dashboardAppName != this.model.application.get('app')) {
                this.applyAppContextToDashboardXML(dashboard, dashboardAppName);
            } else if (dashboardVersion == 2) {
                this.updateUDFDefinition(dashboard);
            }
            dashboard.meta.validate();
            if (dashboard.meta.isValid()) {
                if(dashboard.entry.content.get('eai:type') === 'views'){
                    dashboard.meta.apply();
                }
                var clonePermissions = this.model.perms.get('clonePermissions'),
                    data = {app: this.model.application.get('app')};
                data.owner = (clonePermissions && this.model.acl.get('sharing') !== splunkDUtils.USER) ?
                    splunkDUtils.NOBODY : this.model.application.get("owner");
                dashboard.save({}, {
                    data: data,
                    success: function(model, response) {
                        if (clonePermissions) {
                            var data = this.model.acl.toDataPayload();
                            data.owner = this.model.application.get('owner');
                            dashboard.acl.save({}, {
                                data: data,
                                success: function(model, response){
                                    dashboard.fetch().done(function() {
                                        this.createSuccess();
                                    }.bind(this));
                                }.bind(this)
                            });
                        } else {
                            this.createSuccess();
                        }
                    }.bind(this)
                });
            }
        },
        getReactRoot: function() {
            return this.el;
        },
        getReactComponent: function() {
            return this.model.cloneDashboardInStudio;
        },
        handleCloseModal: function() {
            ReactDOM.unmountComponentAtNode(this.getReactRoot());
        },
        handleSuccess: function(name) {
            var app = this.model.application;
            window.location = route.editDashboard(app.get('root'), app.get('locale'), app.get('app'), name);
        },
        getSimpleXmlDefinition: function(title, description) {
            this.model.dashboard.meta.set({
                label: title,
                description: description
            });
            this.model.dashboard.meta.apply();
            return this.model.dashboard.entry.content.get('eai:data');
        },
        renderReactComponent: function() {
            ReactDOM.render(
                React.createElement(this.getReactComponent(), {
                    open: true,
                    onCloseModal: this.handleCloseModal.bind(this),
                    handleSuccess: this.handleSuccess.bind(this),
                    dashboardTitle: this.model.dashboard.meta.get('label'),
                    dashboardDescription: this.model.dashboard.meta.get('description'),
                    dashboardSharing: this.model.acl.get('sharing'),
                    getSimpleXmlDefinition: this.getSimpleXmlDefinition.bind(this),
                    trackEvent: splunkUtils.trackEvent
                }),
                this.getReactRoot()
            );
        },
        show: function() {
            if (!this.model.cloneDashboardInStudio) {
                Modal.prototype.show.apply(this);
            }
        },
        render: function () {
            if (this.model.cloneDashboardInStudio) {
                this.renderReactComponent();
            } else {
                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Clone").t());
                this.$(Modal.BODY_SELECTOR).prepend(this.children.flashMessages.render().el);
                this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL_JUSTIFIED);
                if (!this.model.dashboard.isHTML()) {
                    this.$(Modal.BODY_FORM_SELECTOR).append(this.children.title.render().el);
                }
                this.$(Modal.BODY_FORM_SELECTOR).append(this.children.filename.render().el);
                if (!this.model.dashboard.isHTML()) {
                    this.$(Modal.BODY_FORM_SELECTOR).append(this.children.description.render().el);
                }
                var sharing = this.model.acl.get('sharing');
                if ((sharing===splunkDUtils.APP && this.model.dashboard.entry.acl.get("can_share_app")) ||
                    (sharing===splunkDUtils.GLOBAL && this.model.dashboard.entry.acl.get("can_share_global"))) {
                    this.$(Modal.BODY_FORM_SELECTOR).append(this.children.permissions.render().el);
                }

                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                this.$(Modal.FOOTER_SELECTOR).append('<a href="#" class="btn btn-primary modal-btn-primary">' + _("Clone Dashboard").t() + '</a>');
            }
            return this;
        }
    });

});
