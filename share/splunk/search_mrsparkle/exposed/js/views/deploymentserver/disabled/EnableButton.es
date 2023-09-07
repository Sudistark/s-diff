import $ from 'jquery';
import BaseView from 'views/Base';
import _ from 'underscore';

export default BaseView.extend({
    tagName: 'a',
    className: 'btn btn-primary',
    events: {
        click() {
            const dfd = this.model.enable.save();
            $.when(dfd).done(() => {
                this.model.reload.save().done(() => {
                    location.reload();
                });
            });
        },
    },
    render() {
        this.$el.html(_('Enable').t());
        return this;
    },
});
