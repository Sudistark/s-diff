define([
    'jquery',
    'underscore',
    'module',
    'views/Base',
    'views/shared/Icon',
    'models/services/server/DistributedHealthDetails',
    'models/services/server/HealthDetails',
    'uri/route',
    'views/shared/splunkbar/health/health_utils',
    'views/shared/splunkbar/healthmodal/DistributedUnhealthyInstances',
    'contrib/text!./HealthContents.html',
    './HealthContents.pcssm',
    'views/shared/splunkbar/healthmodal/GenerateDiag',
    'core-js/es6/set'
],
function(
    $,
    _,
    module,
    BaseView,
    IconView,
    DistributedHealthDetailsModel,
    HealthDetailsModel,
    route,
    HealthUtils,
    DistributedUnhealthyInstances,
    Template,
    css,
    GenerateDiag,
    Set
) {
    return BaseView.extend({
        template: Template,
        moduleId: module.id,
        css: css,
        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
            this.model.healthDetails = new HealthDetailsModel();
            this.model.healthDetails.set({id: 'details'});
            this.model.distributedHealthDetails = new DistributedHealthDetailsModel();
            this.model.distributedHealthDetails.set({id: 'details'});
            this.deferreds = {};
            this.deferreds.healthDetails = this.model.healthDetails.fetch();
            this.deferreds.distributedHealthDetails = this.model.distributedHealthDetails.fetch();
        },

        events: {
            'click a:not([data-test=default-link])': function(e) {
                var target = e.currentTarget;
                var nodeid = $(target).parent('div').data('nodeid');
                this.highlightNode(target);
                this.updateInfo(nodeid);
                e.preventDefault();
            }
        },

        highlightNode: function(target) {
            // Highlight selected node only
            if (this.currentHighlight) {
                this.currentHighlight.removeClass(css.healthSelected);
            }
            $(target).addClass(css.healthSelected);
            this.currentHighlight = $(target);
        },

        updateInfo: function(nodeid) {
            var map = this.model.healthDetails.get('map');
            if (!map || !map[nodeid]) {
                this.showDefaultInfo();
                return;
            }
            var node = map[nodeid];
            if (node.disabled) {
                this.showInfoDisabled(nodeid, node);
                return;
            }

            if(!this.model.distributedHealthDetails.isDisabled()) {
                if(this.getDistHealth(map[nodeid]) != "green") {
                    this.showInfoBox(nodeid, node);
                } else {
                    this.showInfoGood(nodeid, node);
                }
            } else {
                if (node.reasons) {
                    this.showInfoBox(nodeid, node);
                } else {
                    this.showInfoGood(nodeid, node);
                }
            }
        },

        showDefaultInfo: function() {
            this.$('[data-role=info-box]').hide();
            this.$('[data-role=info-good]').hide();
            this.$('[data-role=info-default]').show();
            this.$('[data-role=info-disabled]').hide();

            // green info icon
            if (!this.children.defaultInfoIcon) {
                this.children.defaultInfoIcon = new IconView({icon: 'infoCircle', size: 1.5});
            }
            this.children.defaultInfoIcon.render().appendTo(this.$('[data-role=default-info-icon]'));
            this.$('[data-role=default-info-icon]').attr('class', HealthUtils.getCssInfo());

            // yellow warning icon
            if (!this.children.defaultWarnIcon) {
                this.children.defaultWarnIcon = new IconView({icon: 'warning', size: 1.5});
            }
            this.children.defaultWarnIcon.render().appendTo(this.$('[data-role=default-warn-icon]'));
            this.$('[data-role=default-warn-icon]').attr('class', HealthUtils.getCssWarning());

            // red error icon
            if (!this.children.defaultErrorIcon) {
                this.children.defaultErrorIcon = new IconView({icon: 'error', size: 1.5});
            }
            this.children.defaultErrorIcon.render().appendTo(this.$('[data-role=default-error-icon]'));
            this.$('[data-role=default-error-icon]').attr('class', HealthUtils.getCssError());

            //gray disabled icon
            if (!this.children.defaultDisabledIcon) {
                this.children.defaultDisabledIcon = new IconView({icon: 'questionCircle', size: 1.5});
            }
            this.children.defaultDisabledIcon.render().appendTo(this.$('[data-role=default-disabled-icon]'));
            this.$('[data-role=default-disabled-icon]').attr('class', HealthUtils.getCssDisabled());

            // external link icon for docLink
            if (!this.children.defaultExternalIconDoc) {
                this.children.defaultExternalIconDoc = new IconView({icon: 'external'});
            }
            this.children.defaultExternalIconDoc.render().appendTo(this.$('[data-role=default-docLink]'));
            this.$('[data-role=default-docLink]>[data-icon=external]').addClass(css.external);

            // external link icon for managerLink
            if (!this.children.defaultExternalIconManager) {
                this.children.defaultExternalIconManager = new IconView({icon: 'external'});
            }
            this.children.defaultExternalIconManager.render().appendTo(this.$('[data-role=default-managerLink]'));
            this.$('[data-role=default-managerLink]>[data-icon=external]').addClass(css.external);
        },

        showInfoGood: function(nodeid, node) {
            this.$('[data-role=info-box]').hide();
            this.$('[data-role=info-good]').show();
            this.$('[data-role=info-default]').hide();
            this.$('[data-role=info-disabled]').hide();

            if (!this.children.infoGoodIcon) {
                this.children.infoGoodIcon = new IconView({icon: 'infoCircle', size: 1.5});
            }
            this.children.infoGoodIcon.render().appendTo(this.$('[data-role=info-good-icon]'));
            this.$('[data-role=info-good-icon]').attr('class', HealthUtils.getCssInfo());
            this.$('[data-role=nodeid]').text(nodeid);
        },

        showInfoBox: function(nodeid, node) {
            this.$('[data-role=info-box]').show();
            this.$('[data-role=info-good]').hide();
            this.$('[data-role=info-default]').hide();
            this.$('[data-role=info-disabled]').hide();

            var infoBoxNodeHealth = this.getDistHealth(node);
            var iconName = HealthUtils.getIconName(infoBoxNodeHealth, node.disabled);
            var iconStyle = HealthUtils.getIconStyle(infoBoxNodeHealth, node.disabled);

            if (this.children.infoIcon) {
                this.children.infoIcon.$el.detach();
            }
            this.children.infoIcon = new IconView({icon: iconName, size: 1.5});
            this.children.infoIcon.render().appendTo(this.$('[data-role=info-icon]'));
            this.$('[data-role=info-icon]').attr('class', iconStyle);
            this.$('[data-role=nodeid]').text(nodeid);

            var reasons = node.reasons ? Object.values(node.reasons) : this.getDistReason(node);
            var reasonsHtml = [];
            var root = this.model.application.get('root');
            var locale = this.model.application.get('locale');
            Object.values(reasons[0]).forEach(function(reasonObj) {
                var reason = (reasonObj && reasonObj.reason) ? reasonObj.reason : '';
                var tip = (reasonObj && reasonObj.tip) ? reasonObj.tip : '';
                var docLink =  (reasonObj && reasonObj.doc) ? route.docHelp(root, locale, reasonObj.doc) : '';
                var reasonHtml = _.template(this.reasonTemplate, {
                    reason: reason,
                    docLink: docLink,
                    tip: tip
                });
                var $rHtml = $(reasonHtml);

                if (docLink) {
                    if (!this.children.external) {
                        this.children.external = new IconView({icon: 'external'});
                    }
                    this.children.external.render().appendTo($rHtml.find('[data-role=docLink]'));
                }
                reasonsHtml.push(reasonHtml);
            }.bind(this));
            this.$('[data-role=reasons-list]').html(reasonsHtml);

            if (!this.model.distributedHealthDetails.isDisabled()) {
                this.children.unhealthyInstances = new DistributedUnhealthyInstances({
                    feature: nodeid,
                    getDistFeatureMap: this.getDistFeatureMap,
                    model: {
                        distributedHealthDetails: this.model.distributedHealthDetails
                    }
                });
                this.$('[data-role=unhealthy-instances-list]').html(this.children.unhealthyInstances.render().$el);
                this.$('[data-role=unhealthy-instances-list]').show();
            } else {
                this.$('[data-role=unhealthy-instances-list]').hide();
            }

            if(this.model.user.hasCapability('get_diag')) {
                this.children.generateDiag = new GenerateDiag({
                    feature: nodeid,
                    css: css,
                    getDistFeatureMap: this.getDistFeatureMap,
                });
                this.$('[data-role=generate-diag]').html(this.children.generateDiag.render().$el);
                this.$('[data-role=generate-diag]').show();
            } else {
                this.$('[data-role=generate-diag]').hide();
            }
            
            var msgs = [];
            if(node.messages) {
                Object.values(node.messages).forEach(function(msgObj) {
                    var msg = $('<li>');
                    msg.text(msgObj.message);
                    msgs.push(msg);
                });
            } else {
                var msg = $('<li>');
                msg.text("None");
                msgs.push(msg);
            }
            this.$('[data-role=messages-list]').html(msgs);
        },

        showInfoDisabled: function(nodeid, node) {
            this.$('[data-role=info-box]').hide();
            this.$('[data-role=info-good]').hide();
            this.$('[data-role=info-default]').hide();
            this.$('[data-role=info-disabled]').show();

            if (!this.children.infoDisabledIcon) {
                this.children.infoDisabledIcon = new IconView({icon: 'questionCircle', size: 1.5});
            }
            this.children.infoDisabledIcon.render().appendTo(this.$('[data-role=info-disabled-icon]'));
            this.$('[data-role=info-disabled-icon]').attr('class', HealthUtils.getCssDisabled());
            this.$('[data-role=nodeid]').text(nodeid);
        },

        getDistReason: function(node) {
            var nodeName = this.getDistFeatureMap(node.name);
            var reasons = new Set();
            var reasonObj = [];
            reasonObj[0] = {};
            for (var anomaly = 0; anomaly < this.anomalies.length; anomaly++) {
                if(this.anomalies[anomaly].name.includes(nodeName)) {
                    var instances = this.anomalies[anomaly].instances;
                    for(var instance = 0; instance < instances.length; instance++){
                        if (reasons.has(instances[instance].reason)) {
                            continue;
                        }
                        reasons.add(instances[instance].reason);
                        reasonObj[0][instance] = instances[instance];                        
                    }
                }
            }
            return reasonObj;
        },

        getDistFeatureMap: function(name) {
            var nodeName = "";
            if(name.includes("TailReader")) {
                nodeName = "TailReader";
            }
            else if(name.includes("TCPOutAutoLB")) {
                nodeName = "TCPOutAutoLB";
            }
            else if(name.includes("BatchReader")) {
                nodeName = "BatchReader";
            } else {
                nodeName = name;
            }
            var FEATUREMAP = {
                "TailReader": "Tail Reader",
                "TCPOutAutoLB": "Auto Load Balanced TCP Output",
                "BatchReader": "Batch Reader",
                "Forwarder Ingestion Latency": "Ingestion Latency Reported",
                "Index Optimization": "Bucket Optimization",
                "Search Lag": "Search Scheduler Search Lag",
                "Searches Delayed": "Search Scheduler Searches Delayed",
                "Searches Skipped": "Search Scheduler Searches Skipped"
            };
            if(nodeName in FEATUREMAP){
                return FEATUREMAP[nodeName];
            } else {
                return nodeName;
            }
        },

        getDistHealth: function(node) {
            var nodeName = this.getDistFeatureMap(node.name);
            this.anomalies = this.model.distributedHealthDetails.getAnomalies();
            var nodeHealth = new Set();
            for (var anomaly = 0; anomaly < this.anomalies.length; anomaly++) {
                if(this.anomalies[anomaly].name.includes(nodeName)) {
                    nodeHealth.add(this.anomalies[anomaly].health);
                }
            }
            if(nodeHealth.has("red")) {
                return "red";
            } else if (nodeHealth.has("yellow")) {
                return "yellow";
            } else {
                return node.health;
            }
        },

        renderNode: function(node, $parentSelector, distDisabled) {
            var nodeTemplate = (node.features && node.name !== 'splunkd') ?
                                this.featureTemplate : this.healthTemplate;
            var nodeHealth = (!distDisabled && node.name === 'splunkd') ? this.model.distributedHealthDetails.getHealth() : this.getDistHealth(node);
            var nodeHtml = _.template(nodeTemplate, {
                label: node.name,
                health: nodeHealth,
                css: css
            });
            var $nHtml = $(nodeHtml);

            var iconName = HealthUtils.getIconName(nodeHealth, node.disabled);
            var iconStyle = HealthUtils.getIconStyle(nodeHealth, node.disabled);
            this.children[node.name] = {};
            this.children[node.name].healthIcon = new IconView({icon: iconName, size: 1.5});
            this.children[node.name].healthIcon.render().appendTo($nHtml.find('[data-role=health-icon]'));
            $nHtml.find('[data-role=health-icon]').attr('class', iconStyle);

            $parentSelector.append($nHtml);
            if (node.features) {
                node.features.forEach(function(feature) {
                    this.renderNode(feature, $nHtml);
                }.bind(this));
            }
            return $nHtml;
        },

        focus: function() {
            // focus on first health-node
            var $healthNodes = this.$('[data-role=health]').find('[data-role=health-node]');
            $healthNodes.eq(0).children()[0].focus();
        },

        render: function() {
            $.when(
                this.deferreds.healthDetails,
                this.deferreds.distributedHealthDetails
            ).done(function() {
                var root = this.model.application.get('root');
                var locale = this.model.application.get('locale');
                var helpLink = route.docHelp(root, locale, 'learnmore.component.monitoring');
                var managerLink = route.manager(root, locale, 'system', ['health', 'manager']);

                this.$el.html(this.compiledTemplate({
                    css: css,
                    helplink: helpLink,
                    managerLink: managerLink
                }));

                var node = this.model.healthDetails.get('parsed');
                this.renderNode(node, this.$('[data-role=health]'), this.model.distributedHealthDetails.isDisabled());
                this.showDefaultInfo();
                this.highlightNode(this.$('[data-nodeid=splunkd]').children()[0]);
                this.focus();

               return this;
        	}.bind(this));
        },

        featureTemplate: '\
        <div class="<%-health%>" data-test="node" data-role="feature-node" data-nodeid="<%-label%>">\
            <%- label %>\
        </div>\
        ',

        healthTemplate: '\
        <div class="<%-health%>" data-test="node" data-role="health-node" data-nodeid="<%-label%>">\
            <a href="#"><span data-role="health-icon"></span><%- label %></a>\
        </div>\
        ',

        reasonTemplate: '\
        <li>\
            <span data-role="reason-span"><%- reason %></span>\
            <% if (docLink) { %>\
                <a href="<%- docLink %>" target="_blank" data-role="docLink">\
                    <%- _("Learn more").t() %>\
                </a>\
            <% } %>\
            <% if (tip) { %>\
                <ul data-role="tip-list"><li data-role="tip">\
                    <b><%- _("Tips for Resolution/Investigation: ").t() %></b>\
                    <span data-role="tip-span"><%- tip %></span>\
                </li></ul>\
            <% } %>\
        </li>\
        '
    });
});
