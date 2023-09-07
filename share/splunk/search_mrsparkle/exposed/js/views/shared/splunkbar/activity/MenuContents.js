define(
[
    'underscore',
    'jquery',
    'module',
    'views/Base',
    'views/shared/Icon',
    'contrib/text!./MenuContents.html',
    './MenuContents.pcssm',
    'splunk.util',
    'uri/route'
],
function(
    _,
    $,
    module,
    BaseView,
    IconView,
    activityMenuTemplate,
    css,
    splunk_util,
    route
){
    return BaseView.extend({
        moduleId: module.id,
        template: activityMenuTemplate,
        tagName: 'ul',
        className: css.view,
        events: {
            keydown: function(e) {
                var $activeElement = $(document.activeElement);
                var links = this.$el.find('a');
                for (var i = 0; i < links.length; i += 1) {
                    if ($activeElement[0] === links[i]) {
                        if (e.keyCode === 40) {
                            // Case if [down arrow]
                            links.eq((i + 1) % links.length).focus();
                        } else if (e.keyCode === 38) {
                            // Case if [up arrow]
                            links.eq(((i - 1) + links.length) % links.length).focus();
                        } else if (e.keyCode === 9) {
                            // Case if [tab] and first or last element
                            if ((i === links.length - 1 && !e.shiftKey) ||
                                (i === 0 && e.shiftKey)) {
                                this.trigger('close');
                            }
                        }
                        return;
                    }
                }
            }
        },
        initialize: function(){
            BaseView.prototype.initialize.apply(this, arguments);
            this.model.application.on('change', this.render);
            this.model.user.on('change', this.render);
            this.app = (this.model.application.get('app') == 'system') ? 'search' : this.model.application.get('app');
            this.statusLink = null;

            this.children.icon1 = new IconView({icon: 'external' });
            this.children.icon2 = new IconView({icon: 'external' });

        },
        render: function(){
            // can't render unless we have app and roles info
            if (typeof this.app === "undefined" ||
                typeof this.model.user.entry.content.get('roles') === "undefined") {
            } else {
                var isAdmin = (this.model.user.entry.content.get('roles').indexOf('admin') > -1),
                    jobLink = route.page(
                        this.model.application.get('root'),
                        this.model.application.get('locale'),
                        this.app,
                        'job_manager'
                    ),
                    alertsLink = null;

                if (this.model.user.canUseAlerts()) {
                    alertsLink = route.triggeredAlerts(this.model.application.get('root'), this.model.application.get('locale'), this.app);
                }

                var html = this.compiledTemplate({
                        jobLink:jobLink,
                        alertsLink:alertsLink,
                        statusLink:this.statusLink,
                        css: css
                    });
                this.$el.html(html);

                this.children.icon1.render().appendTo(this.$('[data-role=jobs-link-external]'));
                this.children.icon2.render().appendTo(this.$('[data-role=alerts-link-external]'));
            }
            return this;
        }
    });
});
