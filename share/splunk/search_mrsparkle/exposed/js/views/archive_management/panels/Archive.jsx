import React, { Component } from 'react';
import PropTypes from 'prop-types';
import DL from '@splunk/react-ui/DefinitionList';
import Tooltip from '@splunk/react-ui/Tooltip';
import Heading from '@splunk/react-ui/Heading';
import Table from '@splunk/react-ui/Table';
import Link from '@splunk/react-ui/Link';
import P from '@splunk/react-ui/Paragraph';
import { _ } from '@splunk/ui-utils/i18n';
import { convertToGB, getFormattedValue, emptyArchiveTemplate, constructHistoryData }
    from 'views/shared/indexes/cloud/DynamicDataArchiveUtils';

const columns = [
    { sortKey: 'IndexName', label: _('Index Name') },
    {
        sortKey: 'raw_size',
        label: _('Current Size (GB)'),
        tooltipMsg: _('The current amount of raw data (uncompressed) that is' +
            ' stored in the archive for each index. '),
    },
    { sortKey: 'earliest', label: _('Earliest Event') },
    { sortKey: 'latest', label: _('Latest Event') },
    {
        sortKey: '90-day-archived',
        label: _('90-Day Data Growth (GB)'),
        tooltipMsg: _('The amount of raw data (uncompressed) that has been added' +
            ' to the archive in the past 90 days for each index.'),
    },
    {
        sortKey: '90-day-expired',
        label: _('90-Day Data Expiration (GB)'),
        tooltipMsg: _('The amount of raw data (uncompressed) that has aged out' +
            ' of the archive within the past 90-day window for each index.'),
    },
];

class Archive extends Component {

    static propTypes = {
        learnMoreLink: PropTypes.string.isRequired,
        onFetchArchive: PropTypes.func.isRequired,
    };

    constructor(...args) {
        super(...args);
        this.state = {
            items: [],
            loading: true,
        };
    }

    componentDidMount = () => {
        let data = constructHistoryData();
        data.action = 'time_ranges';
        this.props.onFetchArchive(data)
            .then((response) => {
                if (response.status === 'success') {
                    this.setState({
                        items: response.time_ranges,
                        quarterlyArchiveGrowth: convertToGB(response.quarterlyArchiveGrowth),
                        quarterlyExpiryGrowth: convertToGB(response.quarterlyExpiryGrowth),
                        loading: false,
                    });
                }
            })
            .catch(() => {
                this.setState({ loading: false });
            });
        data = {
            action: 'total_archive_usage',
            start_time: 0,
            end_time: 0,
            output_mode: 'json',
        };
        this.props.onFetchArchive(data)
            .then((response) => {
                this.setState({
                    totalUsage: convertToGB(response.raw_size),
                    entitlement: response.entitlement,
                });
            });
    }

    render() {
        const archiveHeaders = ['IndexName', 'raw_size', 'earliest', 'latest', '90-day-archived', '90-day-expired'];
        const doesExceedEntitlement = !!((this.state.totalUsage - this.state.entitlement) > 0);
        return (
            <div>
                <Heading
                    data-test-name="archive-summary-heading"
                    style={{ marginBottom: '0px' }}
                >
                    {_('Archive Summary')}
                </Heading>
                <P>
                    {_('This page provides an overview of archived data usage for' +
                        ' indexes enabled with the Dynamic Data Active Archive feature.')}
                    <Link
                        to={this.props.learnMoreLink}
                        openInNewContext
                        data-test-name="archive-summary-learnMoreLink"
                        style={{ marginLeft: '5px' }}
                    >
                        {_('Learn More')}
                    </Link>
                </P>
                <DL data-test-name="archive-summary-list" termWidth={300}>
                    <DL.Term data-test-name="total-archive-term">{_('Total Archive Usage')}</DL.Term>
                    <Tooltip
                        data-test-name="total-archive-tooltip"
                        style={{ display: 'block' }}
                        content={doesExceedEntitlement ?
                            _('Your total archive usage exceeds your total entitlement') : ''}
                    >
                        <DL.Description
                            data-test-name="total-archive-desc"
                            style={doesExceedEntitlement ? { color: 'red' } : {}}
                        >
                            {`${this.state.totalUsage} GB`}
                        </DL.Description>
                    </Tooltip>
                    <DL.Term data-test-name="total-entitlement-term">{_('Total Entitlement')}</DL.Term>
                    <DL.Description data-test-name="total-entitlement-desc">
                        {this.state.entitlement > 0 ? `${this.state.entitlement} GB` : 'N/A'}
                    </DL.Description>
                    <DL.Term
                        data-test-name="monthly-growth-term"
                    >
                        {_('Total Archive Data Growth (90 Days)')}
                        <Tooltip
                            data-test-name="archive-growth-tooltip"
                            style={{ marginLeft: '5px' }}
                            content={_('The total amount of raw data (uncompressed)' +
                                ' that has been added to the archive in the past 90 days.')}
                        />
                    </DL.Term>
                    <DL.Description
                        data-test-name="quarterly-growth-desc"
                    >
                        {`${this.state.quarterlyArchiveGrowth} GB`}
                    </DL.Description>
                    <DL.Term
                        data-test-name="quarterly-expiry-term"
                    >
                        {_('Total Archive Data Expiration (90 Days) ')}
                        <Tooltip
                            data-test-name="archive-expiration-tooltip"
                            style={{ marginLeft: '5px' }}
                            content={_('The total amount of raw data (uncompressed)' +
                                ' that has aged out of the archive within the past 90-day window. ')}
                        />
                    </DL.Term>
                    <DL.Description
                        data-test-name="monthly-expiry-desc"
                    >
                        {`${this.state.quarterlyExpiryGrowth} GB`}
                    </DL.Description>
                </DL>
                { this.state.loading && (
                    <div
                        data-test="loading-msg"
                        style={{ marginTop: '100px', textAlign: 'center' }}
                    >
                        {_('Loading...')}
                    </div>)}
                { this.state.items.length === 0 && this.state.loading === false && (emptyArchiveTemplate)}
                { this.state.items.length > 0 && this.state.loading === false &&
                    (<div style={{ marginTop: '20px' }}>
                        <Table stripeRows>
                            <Table.Head>
                                {columns.map(headData => (
                                    <Table.HeadCell
                                        data-test={headData.sortKey}
                                        key={headData.sortKey}
                                    >
                                        {headData.label}
                                        { headData.tooltipMsg && (
                                            <Tooltip
                                                data-test={`archive-table-${headData.label}-tooltip`}
                                                content={headData.tooltipMsg}
                                                style={{ marginLeft: '5px' }}
                                            />
                                        )}
                                    </Table.HeadCell>
                                ))}
                            </Table.Head>
                            <Table.Body>
                                {this.state.items
                                    .map((row, index) => {
                                        const rowKey = `row-${index}`;
                                        return (
                                            <Table.Row key={rowKey} data-test={rowKey}>
                                                {
                                                    archiveHeaders.map(key => (
                                                        <Table.Cell
                                                            key={key}
                                                            data-test={`${rowKey}-${key}`}
                                                        >
                                                            { getFormattedValue(key, row[key]) }
                                                        </Table.Cell>
                                                    ))
                                                }
                                            </Table.Row>
                                        );
                                    })}
                            </Table.Body>
                        </Table>
                    </div>)
                }
            </div>
        );
    }
}

export default Archive;
