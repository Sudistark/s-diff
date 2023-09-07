define([
    'module',
    'react',
    'jquery',
    'underscore',
    '../Base',
    './Title',
    './Description',
    './EditMenu',
    './DashboardModalMessage/DashboardModalMessage',
    'views/dashboard/editor/TitleEditor',
    'views/dashboard/editor/DescriptionEditor',
    'util/react_render',
], function(module,
            React,
            $,
            _,
            BaseDashboardView,
            TitleView,
            DescriptionView,
            EditMenuView,
            DashboardModalMessageView,
            TitleEditor,
            DescriptionEditor,
            reactRender) {

    return BaseDashboardView.extend({
        moduleId: module.id,
        viewOptions: {
            register: false
        },
        className: 'dashboard-header',
        initialize: function(options) {
            BaseDashboardView.prototype.initialize.apply(this, arguments);
            this.showMenu = !options.hideMenu;
            this.showDescription = !!options.showDescription;
            this.allowEdit = options.allowEdit === true;
            this.deferreds = options.deferreds;
            this.listenTo(this.model.state, 'change:mode', this.render);
            this.listenTo(this.settings, 'change', this._handleSettingChange);
            this.listenTo(this.model.page, 'change:theme', function(model, value) {
                this.settings.set('theme', value);
            });
        },
        _handleSettingChange: function() {
            this.model.controller.trigger('edit:dashboard', {
                dashboardId: this.settings.get("id")
            });
        },
        render: function() {
            this.removeTitleView();
            this.removeDescriptionView();
            this.removeHeaderControlsView();
            if ((this.allowEdit && this.isEditMode()) || !this.showMenu) {
                if ((this.allowEdit && this.isEditMode())) {
                    this.createDescriptionEditor();
                    this.createDashboardTitleEditor();
                } else {
                    this.createTitleView();
                    if (this.showDescription) {
                        this.createDescriptionView();
                    }
                }
            } else if (!this.model.page.get("hideTitle")) {
                // render menu once the scheduleView ready
                $.when(this.deferreds.scheduledView, this.deferreds.userPref).then(this.renderMenu.bind(this));
            }
            return this;
        },
        renderMenu: function() {
            this.createHeaderControlsView();
            this.createTitleView();
            if (this.showDescription) {
                this.createDescriptionView();
            }
        },
        createHeaderControlsView: function() {
            this.headerControls = document.createElement('div');
            this.headerControls.className = 'header-controls';

            var dashboardModalMessageView = React.createElement(DashboardModalMessageView);
            this.children.unmountDashboardModalMessageView = reactRender(dashboardModalMessageView, this.headerControls);
            if (!this.model.page.get('hideEdit')) {
                this.children.editMenuView = new EditMenuView({
                    model: this.model,
                    collection: {
                        apps: this.collection.appLocalsUnfilteredAll
                    }
                });
                this.headerControls.appendChild(this.children.editMenuView.render().$el[0]);
            }
            this.$el[0].appendChild(this.headerControls);
        },
        removeHeaderControlsView: function() {
            if (this.children.editMenuView) {
                this.children.editMenuView.remove();
                this.children.editMenuView = null;
            }

            if (this.children.unmountDashboardModalMessageView) {
                this.children.unmountDashboardModalMessageView();
                this.children.unmountDashboardModalMessageView = null;
            }
            if (this.headerControls) {
                this.headerControls.remove();
                this.headerControls = null;
            }
        },
        createTitleView: function() {
            this.children.titleView = new TitleView({
                model: this.model
            });
            this.children.titleView.render().$el.appendTo(this.$el);
        },
        removeTitleView: function() {
            if (this.children.titleView) {
                this.children.titleView.remove();
                this.children.titleView = null;
            }
        },
        createDescriptionView: function() {
            this.children.descriptionView = new DescriptionView({
                model: this.settings
            });
            this.children.descriptionView.render().$el.appendTo(this.$el);
            if (this.$el && this.settings && this.settings.get('description')){
                this.$el.addClass('has-description');
            }
        },
        removeDescriptionView: function() {
            if (this.children.descriptionView) {
                this.children.descriptionView.remove();
                this.children.descriptionView = null;
            }
            if (this.$el){
                this.$el.removeClass('has-description');
            }
        },
        createDashboardTitleEditor: function() {
            this.removeTitleView();
            this.children.titleView = new TitleEditor({
                model: this.settings,
                attribute: 'label',
                placeholder: _('No label').t(),
                tokens: false
            });
            this.children.titleView.render().$el.prependTo(this.$el);
        },
        createDescriptionEditor: function() {
            this.removeDescriptionView();
            this.children.descriptionView = new DescriptionEditor({
                model: this.settings,
                attribute: 'description',
                placeholder: _('No description').t(),
                tokens: false
            });
            this.children.descriptionView.render().$el.prependTo(this.$el);
        }
    });
});
