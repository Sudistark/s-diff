define(
    [
        'underscore',
        'module',
        'views/Base',
        'views/shared/Modal',
        'splunk.util',
        'util/hash_utils'
    ],
    function(_, module, BaseView, ModalView, splunkUtils, hashUtils) {
        return BaseView.extend({
            moduleId: module.id,
            events: {
                'click a.enableEmbedding': function(e) {
                    e.preventDefault();
                    this.model.report.embed.save({}, {
                        success: function() {
                            splunkUtils.trackPageInteraction(
                                this.model.application.get('app'),
                                'Report Embed - Save',
                                {
                                    name: hashUtils.hashSha256(this.model.report.entry.get('name'))
                                });
                        }.bind(this)
                    });
                },
                'click .modal-btn-cancel': function(e) {
                    splunkUtils.trackPageInteraction(
                        this.model.application.get('app'),
                        'Report Embed - Cancel',
                        {
                            name: hashUtils.hashSha256(this.model.report.entry.get('name'))
                        });
                }
            },
            render: function() {
                var confirmationText = splunkUtils.sprintf(_('Are you sure you want to enable embedding for report %s? An embedded report can be viewed by anyone with access to the web page(s) in which it is inserted.').t(),
                                                            '<em>' +_.escape(this.model.report.entry.get('name'))+ '</em>');

                this.$el.html(ModalView.TEMPLATE);
                this.$(ModalView.HEADER_TITLE_SELECTOR).html(_("Enable Report Embedding").t());
                this.$(ModalView.BODY_SELECTOR).append('<p>' + confirmationText + '</p>');
                this.$(ModalView.FOOTER_SELECTOR).append(ModalView.BUTTON_CANCEL);
                this.$(ModalView.FOOTER_SELECTOR).append('<a href="#" class="btn btn-primary modal-btn-primary pull-right enableEmbedding">' + _('Enable Embedding').t() + '</a>');
                return this;
            }
        });
    }
);
