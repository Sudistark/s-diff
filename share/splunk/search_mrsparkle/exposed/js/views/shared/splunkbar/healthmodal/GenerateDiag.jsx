import _ from 'underscore';
import React from 'react';
import P from '@splunk/react-ui/Paragraph';
import ReactAdapterBase from 'views/ReactAdapterBase';
import { createURL } from '@splunk/splunk-utils/url';
import Tooltip from '@splunk/react-ui/Tooltip';

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
        this.featureName = this.options.feature;
        this.genrateDiagUrl = this.generateDiagLink();
        this.tooltipText = 'If filing a support case, click here to generate a diag.';
    },

    generateDiagLink() {
        const feature = this.options.getDistFeatureMap(this.featureName);
        let urlBase = '/app/splunk_rapid_diag/task_template_wizard?feature=';
        this.rdTemplate = this.getFeatureToRDTemplateMap(feature);
        urlBase = urlBase.concat(this.rdTemplate);
        return createURL(urlBase);
    },

    getFeatureToRDTemplateMap(feature) {
        /*eslint-disable */
        const RAPIDDIAGMAP = {
            'Batch Reader': 'batchreader',
            'Tail Reader': 'tailreader',
            'Master Connectivity': 'master_connectivity',
            'Replication Failures': 'replication_failures',
            'Auto Load Balanced TCP Output': 's2s_autolb',
            'Cluster Bundles': 'cluster_bundles',
            'Data Durability': 'data_durability',
            'Data Searchable': 'data_searchable',
            'Bucket Optimization': 'splunkoptimize_processes',
            'Buckets': 'buckets',
            'Disk Space': 'disk_space',
            'Dynamic Data Archived Buckets': 'daa_archived_buckets',
            'Indexers': 'indexers',
            'Indexing Ready': 'indexing_ready',
            'Search Head Connectivity': 'searchheadconnectivity',
            'SHC Cluster Members': 'shc_members_overview',
            'SHC Captain Election': 'shc_captain_election_overview',
            'Captain Connection': 'shc_captain_connection',
            'Common Baseline': 'shc_captain_common_baseline',
            'Snapshot Creation': 'shc_snapshot_creation',
            'Slave State': 'slave_state',
            'Slave Version': 'slave_version',
            'Search Scheduler Searches Skipped': 'searches_skipped',
            'Search Scheduler Searches Delayed': 'searches_delayed',
            'Search Scheduler Search Lag': 'search_lag',
            'System Check': 'wlm_system_check',
            'Configuration Check': 'wlm_configuration_check',
        };
        /*eslint-enable */
        return RAPIDDIAGMAP[feature];
    },

    /**
     * Render the generate diag link, pointing to the respective template in RapidDiag
     * based on selected feature
     */
    getComponent() {
        return (
            <P
                className="generate-diag"
                data-test-name="hr-modal-generate-diag"
            >
                <a
                    href={this.genrateDiagUrl}
                    className={`external`}  // eslint-disable-line
                    target="_blank"
                    rel="noopener noreferrer"
                    data-role="diag-link"
                    data-test="default-link"
                    style={{ fontSize: '15px' }}
                >
                    {_('Generate Diag').t()}
                </a>
                <Tooltip
                    content={this.tooltipText}
                    data-icon="questionCircle"
                    style={{ marginLeft: '5px', whiteSpace: 'normal' }}
                />
            </P>
        );
    },
});