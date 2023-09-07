import React from 'react';
import PropTypes from 'prop-types';
import Table from '@splunk/react-ui/Table';
import Heading from '@splunk/react-ui/Heading';
import DL from '@splunk/react-ui/DefinitionList';
import Tooltip from '@splunk/react-ui/Tooltip';
import Link from '@splunk/react-ui/Link';
import P from '@splunk/react-ui/Paragraph';
import { _ } from '@splunk/ui-utils/i18n';
import { getFormattedValue } from
    'views/shared/indexes/cloud/DynamicDataArchiveUtils';

const RestoreSummary = (props) => {
    const columns = [
        { sortKey: 'index_name', label: _('Index Name') },
        {
            sortKey: 'count',
            label: _('Restore Request Count'),
            tooltipMsg: _('The total number of restoration requests, including both successful and failed ' +
                          'restore requests. This value also includes cleared and expired restore requests. '),
        },
        {
            sortKey: 'size_restored',
            label: _('Restore Size (GB)'),
            tooltipMsg: _('The total amount of raw data (uncompressed) that has been restored. '),
        },
        {
            sortKey: 'count_flushed',
            label: _('Cleared Count'),
            tooltipMsg: _('The total number of restored index requests that have been manually deleted.'),
        },
        {
            sortKey: 'size_flushed',
            label: _('Cleared Size (GB)'),
            tooltipMsg: _('The total amount of raw data (uncompressed) that has been manually deleted.'),
        },
        {
            sortKey: 'count_expired',
            label: _('Expired Count'),
            tooltipMsg: _('The total number of restored index requests that have aged out.'),
        },
        {
            sortKey: 'size_expired',
            label: _('Expired Size (GB)'),
            tooltipMsg: _('The total amount of restored raw data (uncompressed) that has aged out.'),
        },
    ];
    const summaryColumns = ['index_name', 'count', 'size_restored', 'count_flushed', 'size_flushed',
        'count_expired', 'size_expired'];
    return (
        <div>
            <Heading data-test-name="restore-summary-heading">{_('Restore Activity Summary (90 days)')}</Heading>
            <P>
                {_('Overview of restoration activity for indexes enabled with Dynamic Data Active Archive.')}
                <Link
                    to={props.learnMoreLink}
                    openInNewContext
                    data-test-name="archive-summary-learnMoreLink"
                    style={{ marginLeft: '5px' }}
                >
                    {_('Learn More')}
                </Link>
            </P>
            <DL termWidth={300} data-test-name="restore-summary-list">
                <DL.Term data-test-name="total-restore-term">
                    {_('Total Restored Data (GB)')}
                    <Tooltip
                        data-test-name="total-restore-term-tooltip"
                        style={{ marginLeft: '5px' }}
                        content={_('The total amount of raw data (uncompressed) that has been restored.')}
                    />
                </DL.Term>
                <DL.Description data-test-name="total-restore-desc">{`${props.totalRestored} GB`}</DL.Description>
                <DL.Term data-test-name="total-flush-term">
                    {_('Total Cleared Data (GB)')}
                    <Tooltip
                        data-test-name="total-flush-term-tooltip"
                        style={{ marginLeft: '5px' }}
                        content={_('The total amount of raw data  (uncompressed) that has been deleted ' +
                                   'from the restored archive.')}
                    />
                </DL.Term>
                <DL.Description data-test-name="total-flush-desc">{`${props.totalFlushed} GB`}</DL.Description>
                <DL.Term data-test-name="total-expired-term">
                    {_('Total Expired Data (GB)')}
                    <Tooltip
                        data-test-name="total-expired-term-tooltip"
                        style={{ marginLeft: '5px' }}
                        content={_('The total amount of raw data (uncompressed) that has aged out from ' +
                                   'the restored archived.')}
                    />
                </DL.Term>
                <DL.Description data-test-name="total-expired-desc">{`${props.totalExpired} GB`}</DL.Description>
            </DL>
            {
                props.summary && props.summary.length && (
                    <div style={{ marginTop: '20px' }}>
                        <Table
                            stripeRows
                            data-test-name="restore-summary-table"
                        >
                            <Table.Head>
                                {columns.map(column => (
                                    <Table.HeadCell
                                        data-test={column.sortKey}
                                        key={column.sortKey}
                                    >
                                        {column.label}
                                    </Table.HeadCell>
                                ))}
                            </Table.Head>
                            <Table.Body>
                                {
                                    props.summary.map((row, index) => {
                                        const rowKey = `row-${index}`;
                                        return (
                                            <Table.Row>
                                                {
                                                    summaryColumns.map(column => (
                                                        <Table.Cell
                                                            key={column}
                                                            data-test={`${rowKey}-${column}`}
                                                        >
                                                            { getFormattedValue(column, row[column]) }
                                                        </Table.Cell>
                                                    ))
                                                }
                                            </Table.Row>
                                        );
                                    })
                                }
                            </Table.Body>
                        </Table>
                    </div>
                )}
        </div>
    );
};

RestoreSummary.propTypes = {
    summary: PropTypes.arrayOf(PropTypes.shape({
        index_name: PropTypes.string,
        count: PropTypes.number,
        size_restored: PropTypes.number,
        size_flushed: PropTypes.number,
        size_expired: PropTypes.number,
        last_restored: PropTypes.number,
    })).isRequired,
    totalRestored: PropTypes.number.isRequired,
    totalExpired: PropTypes.number.isRequired,
    totalFlushed: PropTypes.number.isRequired,
    learnMoreLink: PropTypes.string.isRequired,
};

export default RestoreSummary;
