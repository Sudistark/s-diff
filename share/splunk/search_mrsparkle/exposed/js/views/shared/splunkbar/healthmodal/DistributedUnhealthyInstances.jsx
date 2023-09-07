import React from 'react';
import ReactAdapterBase from 'views/ReactAdapterBase';
// eslint-disable-next-line no-unused-vars
// import css from 'views/monitoringconsole/Download.pcss';


export default ReactAdapterBase.extend({
    moduleId: module.id,
    /**
     * @param {Object} options {
     *     feature: {String} name of the feature to be
     *     model: {
     *         distributedHealthDetails: <models.services.server.DistributedHealthDetails>
     *     }
     */
    initialize(options) {
        ReactAdapterBase.prototype.initialize.apply(this, options);
        this.instances = [];
        this.featureName = this.options.getDistFeatureMap(this.options.feature);
        this.anomalies = this.options.model.distributedHealthDetails.getAnomalies();
        this.getAllInstances();
    },

    /**
     *
     */
    updateFeature(featureName) {
        this.featureName = featureName;
    },

    /**
     * Get array of instances for the specific feature from the corresponding anomalies reported
     */
    getAllInstances() {
        /*eslint-disable */
        for (let i=0; i<this.anomalies.length; i++) {
            if (this.anomalies[i].name.includes(this.featureName)) {
                for (let j=0; j < this.anomalies[i].instances.length; j++) {
                    this.instances.push(this.anomalies[i].instances[j].name)
                }
            }
        }
        this.instances = [...(new Set(this.instances))];  // dedup the instance array
        this.instances = this.instances.filter(function (el) {
            return el != null;
        });
        /*eslint-enable */
    },

    /**
     * Render the list of unhealthy instance names for this feature
     */
    getComponent() {
        return (
            <div><b>Unhealthy Instances</b>
                <ul data-role="unhealthy-instance-list">
                    {
                        this.instances.length >= 1 ?
                        this.instances.map((instance, index) => (
                            <li key={index} >{instance}</li>)) : 'N/A'  // eslint-disable-line
                    }
                </ul>
            </div>
        );
    },
});