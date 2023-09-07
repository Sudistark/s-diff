import React from 'react';
import ReactAdapterBase from 'views/ReactAdapterBase';
import BackboneProvider from 'dashboard/components/shared/BackboneProvider';
import TableView from './TableView';

export default ReactAdapterBase.extend({
    getComponent() {
        return (
            <BackboneProvider store={{}}>
                <TableView {...this} />
            </BackboneProvider>
        );
    },
});