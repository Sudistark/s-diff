define(
    [
        'underscore',
        'module',
        'models/Base',
        'mixins/dataset',
        'views/Base',
        'splunk.util',
        './ToggleButton',
        '../../Master.pcss'
    ],
    function (
        _,
        module,
        BaseModel,
        datasetMixin,
        BaseView,
        splunkUtil,
        ToggleButton,
        css
    ) {
        return BaseView.extend({
            moduleId: module.id,

            initialize: function () {
                BaseView.prototype.initialize.apply(this, arguments);
                var labels = ["preview", "summarize"];
                var toggleModel = new BaseModel();
                toggleModel.set('selectedClass', labels[0]);
                this.model.dataset.entry.content.set('dataset.display.mode', datasetMixin.MODES.TABLE);
                this.children.buttonGroup = new ToggleButton({
                    className: 'token-button token-button-edit',
                    style: {
                        'padding': '0 14px'
                    },
                    model: toggleModel,
                    labels: labels,
                    toggleChanged: function (e) {
                        // check element: does its class include labels[0] or labels[1]
                        while (e.target) {
                            if (e.target.classList.contains(labels[0])) {
                                toggleModel.set('selectedClass', labels[0]);
                                this.sendTelemetry('Row');
                                break;
                            } else if (e.target.classList.contains(labels[1])) {
                                toggleModel.set('selectedClass', labels[1]);
                                this.sendTelemetry('Summary');
                                break;
                            } else {
                                e.target = e.target.parentElement;
                            }
                        }
                    }.bind(this)
                });
            },

            events: {
                'click button.preview': function (e) {
                    e.preventDefault();
                    this.model.dataset.entry.content.set('dataset.display.mode', datasetMixin.MODES.TABLE);
                },

                'click button.summarize': function (e) {
                    e.preventDefault();
                    this.model.dataset.entry.content.set('dataset.display.mode', datasetMixin.MODES.DATA_SUMMARY);
                }
            },

            sendTelemetry: function (tabSelected) {
                if (!this.options.viewMode) {
                    splunkUtil.trackEvent({
                        type: 'tableUi.interact',
                        data: {
                            action: tabSelected + ' tab selected',
                            location: 'edit table view',
                        },
                    });
                }
            },

            render: function () {
                if (!this.el.innerHTML && this.model.dataset.getType() !== 'inputlookup-table') {
                    this.$el.html(this.compiledTemplate());
                    this.children.buttonGroup.render().appendTo(this.$('.nav-tabs'));
                }

                return this;
            },

            template: '\
                <div class="nav nav-tabs"></div>\
            '
        });
    }
);
