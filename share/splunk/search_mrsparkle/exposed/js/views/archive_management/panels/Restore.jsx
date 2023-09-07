import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Table from '@splunk/react-ui/Table';
import DL from '@splunk/react-ui/DefinitionList';
import Heading from '@splunk/react-ui/Heading';
import { _ } from '@splunk/ui-utils/i18n';
import { createTestHook } from 'util/test_support';
import * as DDAUtils from 'views/shared/indexes/cloud/DynamicDataArchiveUtils';
import RestoreSummary from './RestoreSummary';

class Restore extends Component {

    static propTypes = {
        onFetchHistory: PropTypes.func.isRequired,
    };

    constructor(props, context) {
        super(props, context);
        this.state = {
            sortKey: 'IndexName',
            sortDir: 'asc',
            items: [],
            requestId: '',
        };
    }

    componentDidMount = () => {
        this.props.onFetchHistory(DDAUtils.constructHistoryData())
            .then((response) => {
                this.setState({
                    items: response.items,
                    summary: response.summary,
                    totalSizeRestored: response.total_size_restored,
                    totalSizeExpired: response.total_size_expired,
                    totalSizeFlushed: response.total_size_flushed,
                });
            }); // TODO catch the exception and display error message inside a message container.
    }

    getExpansion = row =>
    (
        <Table.Row
            key={`${row.RequestId}-expansion`}
            data-test={`${row.RequestId}-expanded-row`}
        >
            <Table.Cell style={{ borderTop: 'none' }} colSpan={7}>
                <DL>
                    {
                        ['RequestId', 'EmailAddresses'].map(colName =>
                        (
                            <div key={row[colName]}>
                                <DL.Term>{DDAUtils.localisedStrings[colName]}</DL.Term>
                                <DL.Description
                                    style={{ whiteSpace: 'pre-wrap' }}
                                >
                                    {row[colName] || ' '}
                                </DL.Description>
                            </div>
                        ))
                    }
                    <div key="reason">
                        <DL.Term>{_('Reason')}</DL.Term>
                        <DL.Description>{DDAUtils.getAdditionalStateInfo(row.State)}</DL.Description>
                    </div>
                </DL>
            </Table.Cell>
        </Table.Row>
    );

    handleSort = (e, { sortKey }) => {
        const nextSortDir = DDAUtils.getNextSortDir(this.state.sortKey, this.state.sortDir, sortKey);
        this.setState({
            sortKey,
            sortDir: nextSortDir,
        });
        this.props.onFetchHistory(DDAUtils.constructHistoryData('', sortKey, nextSortDir))
            .then((response) => {
                if (response.count > 0) {
                    this.setState({ items: response.items });
                }
            }); // TODO catch the exception and display error message inside a message container.
    }

    render() {
        const { sortKey, sortDir } = this.state;
        const columns = DDAUtils.getRestoreHistoryColumns(this.state.items);

        return (
            <div>
                <RestoreSummary
                    data-test="restore-summary-table"
                    summary={this.state.summary}
                    totalRestored={this.state.totalSizeRestored}
                    totalExpired={this.state.totalSizeExpired}
                    totalFlushed={this.state.totalSizeFlushed}
                />
                {this.state.items.length > 0 ? (
                    <div>
                        <Heading
                            data-test-name="restore-history-heading"
                        >
                            {_('Last 50 Restore Request History')}
                        </Heading>
                        <Table
                            rowExpansion="single"
                            stripeRows
                            headType="fixed"
                            innerStyle={{ maxHeight: 800 }}
                            {...createTestHook(null, 'ArchiveRestoreHistoryTable')}
                        >
                            <Table.Head>
                                {columns.map(headData => (
                                    <Table.HeadCell
                                        key={headData.sortKey}
                                        onSort={headData.sortKey !== 'Description' ? this.handleSort : undefined}
                                        sortKey={headData.sortKey}
                                        sortDir={headData.sortKey === sortKey ? sortDir : 'none'}
                                    >
                                        {headData.label}
                                    </Table.HeadCell>
                                ))}
                                <Table.HeadCell
                                    key={'TimeToExpire'}
                                >
                                    {_('Expiration Date')}
                                </Table.HeadCell>
                            </Table.Head>
                            <Table.Body>
                                {this.state.items
                                    .map((row, index) => {
                                        const rowKey = `row-${index}`;
                                        return (
                                            <Table.Row
                                                key={rowKey}
                                                data-test={rowKey}
                                                expansionRow={this.getExpansion(row)}
                                            >
                                                { DDAUtils.headers.map(key => (
                                                    <Table.Cell
                                                        key={key}
                                                        data-test={`${rowKey}-${key}`}
                                                    >
                                                        { key === 'State' && DDAUtils.getStateIcon(row[key]) }
                                                        { DDAUtils.getFormattedValue(key, row[key]) }
                                                    </Table.Cell>
                                                )) }
                                                <Table.Cell
                                                    key={'TimeToExpire'}
                                                    data-test={`${rowKey}-TimeToExpire`}
                                                >
                                                    { row.State.substring(0, 6) !== 'Failed' &&
                                                    DDAUtils.getExpirationDate(row.RequestTime) }
                                                </Table.Cell>
                                            </Table.Row>
                                        );
                                    })}
                            </Table.Body>
                        </Table>
                    </div>
                ) : DDAUtils.emptyTemplate }
            </div>
        );
    }
}

export default Restore;