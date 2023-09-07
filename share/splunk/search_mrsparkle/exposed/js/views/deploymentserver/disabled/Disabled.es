import BaseView from 'views/Base';
import route from 'uri/route';
import EnableButton from './EnableButton';

export default BaseView.extend({
    className: 'disabled-msg',
    initialize() {
        this.children.enable = new EnableButton({ model: this.model });
    },
    render() {
        const docUrl = route.docHelp(
            this.model.application.get('root'),
            this.model.application.get('locale'),
            'manager.deployment.overview',
        );

        const html = this.compiledTemplate({ docUrl });
        this.$el.html(html);
        this.children.enable.render().appendTo(this.$('#enablebutton_container'));
        return this;
    },
    template: `
        <div class="section-header section-padded">
            <h2 class="section-title"> <%-_("Forwarder Management").t()%></h2>
            <div id="disabled-content">
                <%-_("Forwarder management is currently disabled on this instance.").t()%>
                <a href="<%-docUrl%>" target="_blank" class="external"><%- _("Learn more.").t() %></a>
            </div>
            <div id="enablebutton_container"></div>
         </div>,
    `,
});
