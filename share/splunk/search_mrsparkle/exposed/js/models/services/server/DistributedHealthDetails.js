define(
    [
        'underscore',
        'models/SplunkDBase'
    ],
    function (_, SplunkDBaseModel) {
        var HEALTHY_STATUS = 'green',
            ATTRIBUTES = [
                'health', 
                'num_green', 
                'num_red', 
                'num_yellow',
                'description',
                'instances',
                'name',
                'path',
                'display_name' 
            ];

        return SplunkDBaseModel.extend({
            urlRoot: 'server/health/deployment',
            id: 'details',
            _getChildFeatures: function (feature) {
                var output = [];
                _.each(feature, function(comp, name) {
                    if (!_.contains(ATTRIBUTES, name)) {
                        if (_.isUndefined(comp.name)) {
                            output.push(_.extend({name: name}, comp));
                        } else {
                            output.push(comp);
                        }
                    }
                }.bind(this));
                return output;
            },
            
            /*
             * Constructing a flat array of all health anomalies using BFS algorithm
             */
            _findAnomalies: function(features) {
                var result = [],
                    queue = [];
                
                _.each(features, function(feature) {
                    if (feature.health !== HEALTHY_STATUS) {
                        feature.name = [feature.display_name || feature.name]; // Storing feature hierarchy 
                        queue.push(feature);
                    }
                });

                while (queue.length > 0) {
                    var curFeature = queue.shift(),
                        nameArr = curFeature.name,
                        childFeatures = this._getChildFeatures(curFeature);
                    
                    if (childFeatures.length > 0) {
                        _.each(childFeatures, function(feature) {
                            var nameArrCopy = nameArr.slice(),
                                display_name = feature.display_name || feature.name;
                            if (feature.health !== HEALTHY_STATUS) {
                                nameArrCopy.push(display_name);
                                feature.name = nameArrCopy; // Storing feature hierarchy 
                                queue.push(feature);
                            }
                        });
                    } else {
                        // Process anomaly format:
                        // 1) Set name to name array of feature hiarchy
                        // 2) Set instances to instances array
                        var instanceArr = this._getChildFeatures(curFeature.instances);
                        curFeature.instances = instanceArr;

                        result.push(curFeature);
                    }
                }
                return result;
            },

            getAnomalies: function() {
                return this.get('parsed') ? this.get('parsed').anomalies : [];
            },

            getFeatures: function() {
                return this.get('parsed') ? this.get('parsed').features : [];
            },

            isDisabled: function() {
                return this.get('parsed') ? this.get('parsed').disabled : true; 
            },

            getHealth: function() {
                return this.get('parsed') ? this.get('parsed').health : "";
            },

            parse: function(response) {
                if (!response.entry) return;
                if (!response.entry[0].content.disabled){
                    var responseObj = response.entry[0].content,
                        rootObj = {
                            name: 'splunkd',
                            health: responseObj.features.splunkd.health,
                            num_red: responseObj.features.splunkd.num_red,
                            num_yellow: responseObj.features.splunkd.num_yellow,
                            disabled: responseObj.disabled,
                            anomalies: []
                        };

                    rootObj.features = this._getChildFeatures(responseObj.features.splunkd);

                    if (rootObj.features && rootObj.features.length > 0 && rootObj.health !== HEALTHY_STATUS) {
                        // Making a deep copy of features array
                        var featuresArrCopy = JSON.parse(JSON.stringify(rootObj.features));
                        rootObj.anomalies = this._findAnomalies(featuresArrCopy);  
                    }

                    this.set('parsed', rootObj);
                    return SplunkDBaseModel.prototype.parse.call(this, response);
                }
            }
    });
});
