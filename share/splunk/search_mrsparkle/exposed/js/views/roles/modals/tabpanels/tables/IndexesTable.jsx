import React, { memo } from 'react';
import PropTypes from 'prop-types';
import Table from '@splunk/react-ui/Table';
import Text from '@splunk/react-ui/Text';
import Switch from '@splunk/react-ui/Switch';
import Menu from '@splunk/react-ui/Menu';
import Tooltip from '@splunk/react-ui/Tooltip';
import { sprintf } from '@splunk/ui-utils/format';
import 'views/roles/Roles.pcss';
import { _ } from '@splunk/ui-utils/i18n';
import { getMenuLabel, scrollToRef, getIndexTooltip } from '../../../Utils';

const IndexesTable = props => (
    <Table
        data-test-name="default-index-table"
        stripeRows
        innerStyle={{ maxHeight: '400px' }}
        outerStyle={{ minWidth: '500px' }}
        headType="fixed"
    >
        <Table.Head>
            <Table.HeadCell data-test-name="index-table-name">
                {_('Index Name')}
                <Text
                    inline
                    style={{ marginLeft: '10px' }}
                    placeholder="filter"
                    name="name"
                    onChange={(e, data) => props.handleIndexFiltering(data, 'indexes')}
                    canClear
                    data-test-name="indexes-filter-text"
                    value={_(props.filterValue)}
                />
            </Table.HeadCell>
            <Table.HeadCell data-test-name="index-table-included" style={{ paddingTop: '6px' }}>
                {_('Included')}
                <Tooltip
                    style={{ marginLeft: '5px' }}
                    content={_('Restrict searches by this role to the specified index(es). ' +
                     'Search results for this role only show events from these index(es).')}
                />
            </Table.HeadCell>
            <Table.HeadCell data-test-name="index-table-default" style={{ paddingTop: '6px' }}>
                {_('Default')}
                <Tooltip
                    style={{ marginLeft: '5px' }}
                    content={_('Set the default index(es) that searches use when no index is' +
                     ' specified. Users with this role can search other indexes with the ' +
                      '"index=" keyword (for example, "index=my_index").')}
                />
            </Table.HeadCell>
            <Table.HeadDropdownCell
                align="right"
                data-test-name="indexes-table-menu"
                label={<div className="roles-menuLabel">{_(getMenuLabel(props.menuSelected))}</div>}
                width={180}
            >
                <Menu>
                    <Menu.Item
                        selectable
                        data-test-name="indexes-table-menu-item-selected"
                        selected={props.menuSelected === 'selected'}
                        onClick={() => props.handleIndexFiltering({ name: 'selected' }, 'indexes')}
                    >
                        {_('Show selected')}
                    </Menu.Item>
                    <Menu.Item
                        selectable
                        data-test-name="indexes-table-menu-item-unselected"
                        selected={props.menuSelected === 'unselected'}
                        onClick={() => props.handleIndexFiltering({ name: 'unselected' }, 'indexes')}
                    >
                        {_('Show unselected')}
                    </Menu.Item>
                    <Menu.Item
                        selectable
                        data-test-name="indexes-table-menu-item-native"
                        selected={props.menuSelected === 'native'}
                        onClick={() => props.handleIndexFiltering({ name: 'native' }, 'indexes')}
                    >
                        {_('Show native')}
                    </Menu.Item>
                    <Menu.Item
                        selectable
                        data-test-name="indexes-table-menu-item-inherited"
                        selected={props.menuSelected === 'inherited'}
                        onClick={() => props.handleIndexFiltering({ name: 'inherited' }, 'indexes')}
                    >
                        {_('Show inherited')}
                    </Menu.Item>
                    <Menu.Item
                        selectable
                        data-test-name="indexes-table-menu-item-wildcard"
                        selected={props.menuSelected === 'wildcards'}
                        onClick={() => props.handleIndexFiltering({ name: 'wildcards' }, 'indexes')}
                    >
                        {_('Show wildcards')}
                    </Menu.Item>
                    <Menu.Item
                        selectable
                        data-test-name="indexes-table-menu-item-all"
                        selected={props.menuSelected === 'all'}
                        onClick={() => props.handleIndexFiltering({ name: 'all' }, 'indexes')}
                    >
                        {_('Show all')}
                    </Menu.Item>
                </Menu>
            </Table.HeadDropdownCell>
        </Table.Head>
        <Table.Body data-test-name="index-table-body">
            {props.indexes.map(row => (
                row.filtered &&
                <Table.Row
                    key={row.name}
                    data={row}
                    data-test-name="index-table-row"
                    elementRef={row.isWildcard && row.isNew ? scrollToRef : () => {}}
                >
                    <Table.Cell
                        key={row.name}
                        data-test-name="index-table-name-cell"
                    >
                        {row.label ? sprintf(_('%s (%s)'), row.name, row.label) : row.name}
                    </Table.Cell>
                    <Table.Cell data-test-name="index-table-allowed-cell">
                        <Tooltip
                            data-test-name="allowed-index-tooltip"
                            content={
                                getIndexTooltip(row, 'srchAllowed')
                            }
                        >
                            <Switch
                                key={`${row.name}-included`}
                                disabled={row.imported_srchAllowed || row.imported_srchDefault ||
                                    row.isIncPreview || row.isDefPreview ||
                                    (row.wildcard_srchAllowed && (row.wildcard_srchAllowed.length > 0)) ||
                                    (row.wildcard_srchDefault && (row.wildcard_srchDefault.length > 0))}
                                value={{ name: row.name, type: 'srchAllowed' }}
                                selected={row.srchAllowed || row.imported_srchAllowed || row.srchDefault ||
                                    row.imported_srchDefault || row.isIncPreview || row.isDefPreview ||
                                    (row.wildcard_srchAllowed && (row.wildcard_srchAllowed.length > 0)) ||
                                    (row.wildcard_srchDefault && (row.wildcard_srchDefault.length > 0))}
                                appearance="checkbox"
                                onClick={props.handleIndexesToggle}
                                data-test-name={`${row.name}-included-idx-switch`}
                            />
                        </Tooltip>
                    </Table.Cell>
                    <Table.Cell data-test-name="index-table-default-cell">
                        <Tooltip
                            data-test-name="default-index-tooltip"
                            content={
                                getIndexTooltip(row, 'srchDefault')
                            }
                        >
                            <Switch
                                key={`${row.name}-default`}
                                disabled={row.imported_srchDefault || row.isDefPreview ||
                                    (row.wildcard_srchDefault && (row.wildcard_srchDefault.length > 0))}
                                selected={row.srchDefault || row.imported_srchDefault || row.isDefPreview ||
                                    (row.wildcard_srchDefault && (row.wildcard_srchDefault.length > 0))}
                                value={{ name: row.name, type: 'srchDefault' }}
                                appearance="checkbox"
                                onClick={props.handleIndexesToggle}
                                data-test-name={`${row.name}-default-idx-switch`}
                            />
                        </Tooltip>
                    </Table.Cell>
                    <Table.Cell />
                </Table.Row>
            ))}
        </Table.Body>
    </Table>
);

IndexesTable.propTypes = {
    indexes: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    handleIndexesToggle: PropTypes.func.isRequired,
    handleIndexFiltering: PropTypes.func.isRequired,
    menuSelected: PropTypes.string.isRequired,
    filterValue: PropTypes.string.isRequired,
};

export default memo(IndexesTable);
