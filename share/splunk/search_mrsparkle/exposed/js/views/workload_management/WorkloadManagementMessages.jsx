import { createTestHook } from 'util/test_support';
import _ from 'underscore';
import React from 'react';
import Message from '@splunk/react-ui/Message';
import PropTypes from 'prop-types';
import './WorkloadManagement.pcssm';

const HeaderSection = (props) => {
    const {
        canEditWorkloadPools,
        canEditWorkloadRules,
        tabBarState,
        isEnabled,
        getDefaultSearchPool,
        getDefaultIngestPool,
        getSearchPools,
        getIngestPools,
        getMiscPools,
        isSearchCategoryAllocated,
        isIngestCategoryAllocated,
        isMiscCategoryAllocated,
        statusErrorMessage,
        missingTablesMessage,
        admissionRules,
    } = props;

    let requiredSearchPoolMessage = '';
    let requiredIngestPoolMessage = '';
    if (!isEnabled && canEditWorkloadPools && _.isEmpty(getDefaultSearchPool)) {
        requiredSearchPoolMessage = _('You must create a default search pool ' +
            'before enabling workload management.').t();
    }

    if (!isEnabled && canEditWorkloadPools && _.isEmpty(getDefaultIngestPool)) {
        requiredIngestPoolMessage = _('You must create a default ingest pool ' +
            'before enabling workload management.').t();
    }

    let searchCategoryUnderUtilized = '';
    if (_.isEmpty(getSearchPools) && isSearchCategoryAllocated) {
        searchCategoryUnderUtilized = _('You must create a workload pool in the search category to ' +
            'allocate resources available in the search category.').t();
    }

    let ingestCategoryUnderUtilized = '';
    if (_.isEmpty(getIngestPools) && isIngestCategoryAllocated) {
        ingestCategoryUnderUtilized = _('You must create a workload pool in the ingest category to ' +
            'allocate resources available in the ingest category.').t();
    }

    let miscCategoryUnderUtilized = '';
    if (_.isEmpty(getMiscPools) && isMiscCategoryAllocated) {
        miscCategoryUnderUtilized = _('You must create a workload pool in the misc category to ' +
            'allocate resources available in the misc category.').t();
    }
    return (
        <div {...createTestHook(module.id)}>
            <div style={{ display: tabBarState === 'rules' || tabBarState === 'pools' ? 'block' : 'none' }}>
                <div style={{ float: 'left' }}>
                    { !_.isEmpty(statusErrorMessage) && isEnabled &&
                    (canEditWorkloadPools || canEditWorkloadRules) ?
                        <Message type="error">{statusErrorMessage}</Message>
                        : null
                    }

                    { !_.isEmpty(missingTablesMessage) ?
                        <Message type="info">{missingTablesMessage}</Message>
                        : null
                    }

                    { !_.isEmpty(requiredSearchPoolMessage) ?
                        <Message type="info">{requiredSearchPoolMessage}</Message>
                        : null
                    }

                    { !_.isEmpty(requiredIngestPoolMessage) ?
                        <Message type="info">{requiredIngestPoolMessage}</Message>
                        : null
                    }

                    { !_.isEmpty(searchCategoryUnderUtilized) ?
                        <Message type="info">{searchCategoryUnderUtilized}</Message>
                        : null
                    }

                    { !_.isEmpty(ingestCategoryUnderUtilized) ?
                        <Message type="info">{ingestCategoryUnderUtilized}</Message>
                        : null
                    }

                    { !_.isEmpty(miscCategoryUnderUtilized) ?
                        <Message type="info">{miscCategoryUnderUtilized}</Message>
                        : null
                    }
                </div>
            </div>
            <div style={{ display: tabBarState === 'admission' ? 'block' : 'none' }}>
                <div style={{ float: 'left' }}>
                    {_.isEmpty(admissionRules) ?
                        <Message type="info">
                            {_(`No admission rules are defined. 
                            Click the Add Admission Rule button to create new admision rules.`).t()}
                        </Message>
                        : null
                    }
                    {_.isEmpty(admissionRules) ?
                        <Message type="info">
                            {_(`Use admission rules to filter out searches 
                            before they run based on conditions that you define.`).t()}
                        </Message>
                        : null
                    }
                </div>
            </div>
        </div>
    );
};

HeaderSection.propTypes = {
    canEditWorkloadPools: PropTypes.bool.isRequired,
    canEditWorkloadRules: PropTypes.bool.isRequired,
    tabBarState: PropTypes.string.isRequired,
    isEnabled: PropTypes.bool.isRequired,
    getDefaultSearchPool: PropTypes.shape({}).isRequired,
    getDefaultIngestPool: PropTypes.shape({}).isRequired,
    getSearchPools: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    getIngestPools: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    getMiscPools: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    isSearchCategoryAllocated: PropTypes.bool.isRequired,
    isIngestCategoryAllocated: PropTypes.bool.isRequired,
    isMiscCategoryAllocated: PropTypes.bool.isRequired,
    statusErrorMessage: PropTypes.string.isRequired,
    missingTablesMessage: PropTypes.string.isRequired,
    admissionRules: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

HeaderSection.defaultProps = {};

export default HeaderSection;
