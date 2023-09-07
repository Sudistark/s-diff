import React from 'react';
import ReactAdapterBase from 'views/ReactAdapterBase';
import BackboneProvider from 'dashboard/components/shared/BackboneProvider';
import GlobalBanner from 'views/shared/global_banner/GlobalBanner';

export default ReactAdapterBase.extend({
    getComponent() {
        return (
            <BackboneProvider store={{}}>
                <GlobalBanner {...this} />
            </BackboneProvider>
        );
    },
});
