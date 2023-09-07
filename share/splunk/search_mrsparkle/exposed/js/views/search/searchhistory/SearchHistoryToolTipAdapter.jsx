import React from 'react';
import BackBoneProvider from 'dashboard/components/shared/BackboneProvider';
import ReactAdapterBase from 'views/ReactAdapterBase';
import SearchHistoryToolTip from 'views/search/searchhistory/SearchHistoryToolTip';

export default ReactAdapterBase.extend({
    getComponent() {
        return (
            <BackBoneProvider store={{}}>
                <SearchHistoryToolTip />
            </BackBoneProvider>
        );
    },
});