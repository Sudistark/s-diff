define(function(require) {
    var _ = require('underscore'),
            Backbone = require('backbone');

    var DashboardTitle = Backbone.View.extend({
        initialize: function() {
            this.model.on('change:edit change:label', this.render, this);
        },
        render: function() {
            if(!this.model.has('label')) {
                this.model.set({ label: this.$el.text() }, { silent: true });
            }
            this.$('.edit-label').remove();
            this.$el.text(_(this.model.get('label')).t());
            if(this.model.get('edit')) {
                var editLabelElement = document.createElement('span');
                editLabelElement.classList.add('edit-label');
                editLabelElement.innerHTML = _("Edit").t() + ': ';
                this.el.insertBefore(editLabelElement, this.el.firstChild);
            }
            return this;
        }
    });

    return DashboardTitle;

});
