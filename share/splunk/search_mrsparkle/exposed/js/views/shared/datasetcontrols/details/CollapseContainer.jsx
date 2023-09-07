import _ from 'underscore';
import React from 'react';
import ReactAdapterBase from 'views/ReactAdapterBase';
import CollapsiblePanel from '@splunk/react-ui/CollapsiblePanel';
import BackboneProvider from 'dashboard/components/shared/BackboneProvider';
import Detail from './Detail';

export default ReactAdapterBase.extend({
    moduleId: module.id,
    /**
     * @constructor
     * @memberOf views
     * @name CollapseDetail
     * @extends {views.ReactAdapterBase}
     * @description Backbone wrapper for react icons
     */

    getComponent() {
        /**
             * 3 cases for lightning icon:
             * 1. do not show lightning icon: dataset can't be accelerated
             * 2. show lightning icon: dataset can be accelerated AND is not accelerated
             * 3. show lightning icon and selected lightning icon: dataset can be accelerated AND is accelerated
             */
        let icon = '';
        const canBeAccelerated = this.model.dataset.typeCanBeAccelerated;

        if (canBeAccelerated()) {
            let suffix = 'icon-lightning';
            if (this.model.dataset.isAcceleratedDataset()) {
                suffix += ' icon-lightning-selected';
            }
            const str = this.model.dataset.isAcceleratedDataset() ? _('Accelerated').t() : _('Not Accelerated').t();
            icon = (<i
                style={{ marginLeft: '10px' }}
                className={suffix}
                title={str}
            />);
        }

        return (
            <BackboneProvider store={{}} model={this.model} collection={this.collection}>
                <CollapsiblePanel
                    title={
                        <p className="section-title">{
                            this.model.dataset.getFormattedName()}{canBeAccelerated && icon}</p>}
                >
                    <Detail model={this.model} collection={this.collection} />
                </CollapsiblePanel>
            </BackboneProvider>
        );
    },
});

