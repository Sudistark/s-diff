import React from 'react';
import ReactAdapterBase from 'views/ReactAdapterBase';
import BackboneProvider from 'dashboard/components/shared/BackboneProvider';
import Tiles from '@splunk/react-icons/Tiles';
import HamburgerMenu from '@splunk/react-icons/HamburgerMenu';
import ButtonGroup from '@splunk/react-ui/ButtonGroup';
import Button from '@splunk/react-ui/Button';

export default ReactAdapterBase.extend({
    moduleId: module.id,
    /**
     * @constructor
     * @memberOf views
     * @name ToggleButton
     * @extends {views.ReactAdapterBase}
     * @description Backbone wrapper for react icons
     *
     * @param {Object} options
     * @param {Object} options.model The model supplied to this class
     */
    initialize(options) {
        ReactAdapterBase.prototype.initialize.apply(this, options);
        this.listenTo(this.model, 'change:selectedClass', this.render);
    },

    getComponent() {
        const selectedClass = this.model.get('selectedClass');
        return (
            <BackboneProvider store={{}} model={this.model}>
                <ButtonGroup>
                    <Button
                        size="small"
                        label="Rows"
                        data-test-name="rows"
                        className={this.options.labels[0]}
                        style={this.options.style}
                        icon={<HamburgerMenu />}
                        selected={selectedClass === this.options.labels[0]}
                        onClick={this.options.toggleChanged}
                    />
                    <Button
                        size="small"
                        label="Summary"
                        data-test-name="summary"
                        className={this.options.labels[1]}
                        style={this.options.style}
                        icon={<Tiles />}
                        selected={selectedClass === this.options.labels[1]}
                        onClick={this.options.toggleChanged}
                    />
                </ButtonGroup>
            </BackboneProvider>
        );
    },
});
