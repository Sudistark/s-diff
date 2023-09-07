import React, { Component } from 'react';
import { debounce } from 'lodash';
import PropTypes from 'prop-types';
import { _ } from '@splunk/ui-utils/i18n';
import Circle from '@splunk/react-icons/Circle';
import ColumnLayout from '@splunk/react-ui/ColumnLayout';
import ComboBox from '@splunk/react-ui/ComboBox';
import ControlGroup from '@splunk/react-ui/ControlGroup';
import DL from '@splunk/react-ui/DefinitionList';
import Heading from '@splunk/react-ui/Heading';
import P from '@splunk/react-ui/Paragraph';
import Table from '@splunk/react-ui/Table';
import Text from '@splunk/react-ui/Text';
import Tooltip from '@splunk/react-ui/Tooltip';
import TriangleUp from '@splunk/react-icons/TriangleUp';
import SearchJob from '@splunk/search-job';
import Star from '@splunk/react-icons/Star';
import { RolesTree } from 'views/view_indexes/RolesTree';
import * as style from 'views/view_indexes/Master.pcss';
import { createRESTURL } from '@splunk/splunk-utils/url';
import querystring from 'querystring';
import { defaultFetchInit, handleResponse, handleError } from '@splunk/splunk-utils/fetch';
import { createTestHook } from 'util/test_support';

class View extends Component {
    static propTypes = {
        entity: PropTypes.string.isRequired,
        entityType: PropTypes.oneOf(['users', 'roles']).isRequired,
    };

    constructor(props, context) {
        super(props, context);
        this.debouncedUpdateTrees = debounce(this.updateTree, 400);
        this.indexListSearchJob = this.createSearchJob();

        this.state = {
            errorMessage: '',
            /** The name of the role or user */
            entity: props.entity,
            /** The location of where this component is accessed: 'roles' || 'users' */
            entityType: props.entityType,
            /** The index being drilled down */
            index: '',
            /** Collection of indexes returned from search */
            indexes: [],
            /** Roles assigned to a user or single role if component is accessed from roles page */
            rolesAssigned: [],
            /** Collection of roles returned from REST */
            rolesCollection: [],
            /** Array representation of Roles Trees to be parsed by <Table> */
            rolesListing: [],
            /** Hashmap with role name as the key and it's inheritance tree as the value */
            roleTreesMap: {},
        };
    }

    componentDidMount() {
        // Fetch roles collection
        const rolesUrl = createRESTURL(`authorization/roles?${querystring.encode({ count: -1, output_mode: 'json' })}`);
        this.fetchData(rolesUrl, 'roles')
            .then((roleRes) => {
                // If the view is entered from the users page, we run an additional fetch to get
                // inherited roles of the user
                if (this.state.entityType === 'users') {
                    const userUrl = createRESTURL(`admin/users/${encodeURIComponent(
                        this.state.entity)}?${querystring.encode({ count: 1, output_mode: 'json' })}`);
                    this.fetchData(userUrl, 'users')
                        .then((userRes) => {
                            this.setState({
                                rolesAssigned: this.getRolesAssigned(userRes.entry[0].content.roles, roleRes.entry),
                            });
                        });
                } else if (this.state.entityType === 'roles') {
                    this.setState({ rolesAssigned: this.getRolesAssigned([this.state.entity], roleRes.entry) });
                }
                this.setState({ rolesCollection: roleRes.entry });
            })
            .catch(res => this.setState({ errorMessage: res.message }));

        // Run search job to get list of local and remote indexes
        this.indexSrchJob = this.indexListSearchJob.getResults &&
            this.indexListSearchJob.getResults({ count: 1000 }).subscribe((results) => {
                if (results.results && results.results.length) {
                    this.setState({ indexes: results.results });
                }
            });
    }
    componentDidUpdate(prevProps, prevState) {
        // If the index changed, update the tree.
        if (this.state.index !== prevState.index) {
            this.debouncedUpdateTrees();
        }
    }
    /**
     * Converts string rolenames to it's corresponding REST object
     * @param {Array} strRoles - Array of strings
     * @param {Array} rolesCollection - Array of roleObjects returned from REST
     * @returns {Array} of objects
     */
    getRolesAssigned = (strRoles, rolesCollection) => (
        strRoles.map(strRole => (rolesCollection.find(roleObj => (roleObj.name === strRole))))
    )

    getIcon = (settingsMap, setting) => {
        const natIcon = (<TriangleUp {...createTestHook(null, 'nativeIcon')} />);
        const inherIcon = (<Circle {...createTestHook(null, 'inheritedIcon')} />);
        if (setting === 'included') {
            if (settingsMap.srchAllow) {
                return natIcon;
            } else if (settingsMap.impSrchAllow) {
                return inherIcon;
            }
        } else if (setting === 'default') {
            if (settingsMap.srchDef) {
                return natIcon;
            } else if (settingsMap.impSrchDef) {
                return inherIcon;
            }
        }
        return _('');
    }

    updateTree = () => {
        const roleTreesMap = {};
        // Generate the roles tree
        this.state.rolesAssigned.forEach((role) => {
            roleTreesMap[role.name] = new RolesTree(role, this.state.rolesCollection, this.state.index);
        });

        let rolesListing = [];
        Object.keys(roleTreesMap).forEach((key) => {
            rolesListing = [...rolesListing, ...roleTreesMap[key].rolesArr];
        });

        // Dedup roles
        const dedupedRoles = rolesListing.reduce((acc, current) => {
            const valExists = !!acc.find(item => item.data.name === current.data.name);
            if (valExists) {
                return acc;
            }
            return acc.concat(current);
        }, []);
        // Sort roles
        const sortedRoles = dedupedRoles.sort((a, b) => {
            if (a.data.name < b.data.name) {
                return -1;
            } else if (a.data.name > b.data.name) {
                return 1;
            }
            return 0;
        });

        this.setState({ rolesListing: sortedRoles, roleTreesMap });
    }

    /**
     * Fetch REST data
     * @param {String} url - REST endpoint url.
     * @returns Promise
     */
    fetchData = (url, collection) => (
        fetch(url, {
            ...defaultFetchInit,
            method: 'GET',
        })
        .then(handleResponse(200))
        .catch(handleError(_(`Unable to fetch ${collection}.`)))
    )

    /**
     * Create a search job to get all the local and remote indexes.
     * @returns {SearchJob}
     */
    createSearchJob = () => (
        SearchJob.create({
            search: '| eventcount summarize=false index=* index=_* | dedup index | head 1000',
        })
    )

    handleIndexChange = (e, { value }) => {
        this.setState({ index: value });
    }

    render() {
        return (
            <div {...createTestHook(module.id)} style={{ paddingLeft: '20px' }}>
                <div id="viewIdx-heading">
                    <Heading level={1}>
                        {_('View index inheritance')}
                    </Heading>
                    <P>{_('Show inheritance of index settings within roles.')}</P>
                </div>
                <ColumnLayout style={{ maxWidth: '800px' }} {...createTestHook(null, 'viewIdx-col-layout')}>
                    <ColumnLayout.Row>
                        <ColumnLayout.Column {...createTestHook(null, 'viewIdx-col-entity')} span={6}>
                            <ControlGroup
                                {...createTestHook(null, 'ctrlGrp-entity')}
                                label={this.state.entityType === 'users' ? _('User') : _('Role')}
                            >
                                <Text
                                    {...createTestHook(null, 'ctrlGrp-entity-text')}
                                    disabled
                                    value={this.state.entity}
                                />
                            </ControlGroup>
                            <ControlGroup
                                {...createTestHook(null, 'ctrlGrp-idx')}
                                help={_('Type in or select an index to see its inheritance.')}
                                label={_('Index')}
                                tooltip={_('To change index settings for a role, use the "Roles" page.')}
                            >
                                <ComboBox
                                    {...createTestHook(null, 'ctrlGrp-idx-combobox')}
                                    onChange={this.handleIndexChange}
                                    value={this.state.index}
                                >
                                    {this.state.indexes.map(idx => (
                                        <ComboBox.Option
                                            {...createTestHook(null, `ctrlGrp-idx-comboboxOpt-${idx.index}`)}
                                            key={idx.index}
                                            value={idx.index}
                                        />
                                    ))}
                                </ComboBox>
                            </ControlGroup>
                        </ColumnLayout.Column>
                        <ColumnLayout.Column {...createTestHook(null, 'viewIdx-col-legend')} span={6}>
                            <ControlGroup
                                {...createTestHook(null, 'ctrlGrp-dl')}
                                label={_('Legend')}
                            >
                                <DL
                                    {...createTestHook(null, 'legend-dl')}
                                    id="legend-dl"
                                >
                                    <DL.Term>{_('Native')}</DL.Term>
                                    <DL.Description>
                                        <TriangleUp {...createTestHook(null, 'nativeIcon')} />
                                    </DL.Description>
                                    <DL.Term>{_('Inherited')}</DL.Term>
                                    <DL.Description>
                                        <Circle {...createTestHook(null, 'inheritedIcon')} />
                                    </DL.Description>
                                    { this.state.entityType === 'users' && (
                                        <div>
                                            <DL.Term>
                                                {_('Assigned')}
                                                <Tooltip
                                                    className="spaceLeft"
                                                    content={`User ${this.state.entity} holds this role.`}
                                                />
                                            </DL.Term>
                                            <DL.Description>
                                                <Star
                                                    {...createTestHook(null, 'assignedIcon')}
                                                    className="spaceLeft"
                                                />
                                            </DL.Description>
                                        </div>
                                    )}
                                </DL>
                            </ControlGroup>
                        </ColumnLayout.Column>
                    </ColumnLayout.Row>
                </ColumnLayout>
                <Table
                    {...createTestHook(null, 'viewIdx-table')}
                    innerStyle={{ backgroundColor: style.whiteColor }}
                    outerStyle={{ width: '800px' }}
                    stripeRows
                >
                    <Table.Head>
                        <Table.HeadCell>{_('Roles')}</Table.HeadCell>
                        <Table.HeadCell>{_('Included')}</Table.HeadCell>
                        <Table.HeadCell>{_('Default')}</Table.HeadCell>
                        <Table.HeadCell>{_('Inherits from')}</Table.HeadCell>
                    </Table.Head>
                    <Table.Body>
                        {this.state.rolesListing.length > 0 && this.state.rolesListing.map(row => (
                            <Table.Row {...createTestHook(null, `viewIdx-tr-${row.data.name}`)} key={row.data.name}>
                                <Table.Cell {...createTestHook(null, 'viewIdx-tc-roles')}>
                                    {row.data.name}
                                    {this.state.entityType === 'users' && Object.prototype.hasOwnProperty.call(
                                        this.state.roleTreesMap, row.data.name) && (
                                        <Star
                                            {...createTestHook(null, 'assignedIcon')}
                                            style={{ marginLeft: '5px' }}
                                        />
                                    )}
                                </Table.Cell>
                                <Table.Cell {...createTestHook(null, 'viewIdx-tc-inc')}>
                                    {this.getIcon(row.data.idxSettings, 'included')}
                                </Table.Cell>
                                <Table.Cell {...createTestHook(null, 'viewIdx-tc-def')}>
                                    {this.getIcon(row.data.idxSettings, 'default')}
                                </Table.Cell>
                                <Table.Cell {...createTestHook(null, 'viewIdx-tc-inher')}>
                                    {row.children.map(child => (child.data.name)).join(', ')}
                                </Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
            </div>
        );
    }
}

export default View;