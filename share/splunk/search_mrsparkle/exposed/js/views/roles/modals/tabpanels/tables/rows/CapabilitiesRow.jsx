import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Table from '@splunk/react-ui/Table';
import 'views/roles/Roles.pcss';
import { _ } from '@splunk/ui-utils/i18n';

class CapabilitiesRow extends Component {
    static propTypes = {
        data: PropTypes.shape({}).isRequired,
        isPreview: PropTypes.bool.isRequired,
        name: PropTypes.string.isRequired,
        onRequestToggle: PropTypes.func.isRequired,
        selected: PropTypes.bool.isRequired,
        source: PropTypes.string.isRequired,
        stripe: PropTypes.string,
    };
    static defaultProps = {
        stripe: 'none',
    }

    constructor(props, context) {
        super(props, context);
        this.onRequestToggle = props.onRequestToggle;
    }

    shouldComponentUpdate(nextProps) {
        // In the context of a row, we only need to update the component when a
        // user toggles the row. Otherwise, we do not update.
        if (this.props.selected !== nextProps.selected) {
            return true;
        }
        return false;
    }
    render() {
        return (
            <Table.Row
                key={this.props.name}
                onRequestToggle={this.props.onRequestToggle}
                data={this.props.data}
                disabled={this.props.source === 'inherited' || this.props.isPreview}
                selected={this.props.isPreview || this.props.selected}
                stripe={this.props.stripe}
            >
                <Table.Cell
                    key={this.props.name}
                    data-test-name="capabilities-name-cell"
                >
                    {this.props.name}
                </Table.Cell>
                <Table.Cell
                    key={`${this.name}-${this.source}`}
                    data-test-name="capabilities-source-cell"
                >
                    {this.props.isPreview ? _('inherited') : this.props.source}
                </Table.Cell>
            </Table.Row>
        );
    }
}

export default CapabilitiesRow;
