define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'views/shared/FlashMessages',
        'views/shared/Modal',
        'splunk.util'
    ],
    function(
        $,
        _,
        module,
        Base,
        FlashMessage,
        Modal,
        splunkUtils
    ) {
        return Base.extend({
            moduleId: module.id,

            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);

                this.children.flashMessage = new FlashMessage({ model: this.model.inmem });

            },

            events: {
                "click .modal-btn-primary": function(e) {
                    this.submit();
                    e.preventDefault();
                }
            },

            submit: function() {
                this.model.inmem.entry.content.set({
                    'request.ui_dispatch_view': this.model.application.get('page')
                });

                this.model.inmem.save({}, {
                    success: function(model, response) {
                        this.model.inmem.trigger('saveSuccess');
                    }.bind(this)
                });
            },

            render: function() {
                
                var header = splunkUtils.sprintf(_('Save Table - %s').t(),
                    this.model.inmem.entry.content.get('displayName'));

                this.$el.html(Modal.TEMPLATE);

                this.$(Modal.HEADER_TITLE_SELECTOR).html(header);

                this.children.flashMessage.render().prependTo(this.$(Modal.BODY_SELECTOR));

                // Add content to body
                $(_.template(this.warningTemplate, {_: _})).appendTo(this.$(Modal.BODY_SELECTOR));
                this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL);

                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_SAVE);

                return this;
            },

            warningTemplate: '\
                <div class="alert alert-warning">\
                    <i class="icon-alert"></i>\
                    <%- _("If you save this dataset, any changes that you have made will propagate to datasets extended from it.").t() %>\
                </div>\
            '
        });
    }
);
