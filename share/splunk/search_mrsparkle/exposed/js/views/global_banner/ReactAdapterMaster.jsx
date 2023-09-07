import React from 'react';
import ReactAdapterBase from 'views/ReactAdapterBase';
import BackboneProvider from 'dashboard/components/shared/BackboneProvider';
import GlobalBannerSettings from 'views/global_banner/GlobalBannerSettings';

export default ReactAdapterBase.extend({
    getComponent() {
        return (
            <BackboneProvider store={{}}>
                <GlobalBannerSettings {...this} />
            </BackboneProvider>
        );
    },
});
