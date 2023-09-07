import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { sprintf } from '@splunk/ui-utils/format';
import { debounce, has, keyBy } from 'lodash';
import { _ } from '@splunk/ui-utils/i18n';
import route from 'uri/route';
import Button from '@splunk/react-ui/Button';
import TabLayout from '@splunk/react-ui/TabLayout';
import ControlGroup from '@splunk/react-ui/ControlGroup';
import Message from '@splunk/react-ui/Message';
import Modal from '@splunk/react-ui/Modal';
import Text from '@splunk/react-ui/Text';
import 'views/roles/Roles.pcss';
import IndexFieldValues from 'models/access_control/IndexFieldValues';
import ResourcePanel from './tabpanels/Resources';
import InheritancePanel from './tabpanels/Inheritance';
import CapabilitiesPanel from './tabpanels/Capabilities';
import IndexesPanel from './tabpanels/Indexes';
import RestrictionsPanel from './tabpanels/Restrictions';
import * as Utils from '../Utils';

const NEW_ROLE_ACTIONS = ['new', 'clone'];

class AddEditRoles extends Component {
    /**
     * See base-lister/src/Main.jsx for propTypes definition.
     */
    static propTypes = {
        /**
         * 'action' parameter. Can be one of the following:
         *  - 'edit'              triggered from columns.Actions
         *  - 'new'               triggered from table.Header
         */
        action: PropTypes.oneOf(['new', 'edit', 'clone']).isRequired,
        open: PropTypes.bool.isRequired,
        object: PropTypes.shape({
            name: PropTypes.string,
            content: PropTypes.shape({
                defaultApp: PropTypes.string,
                srchFilter: PropTypes.string,
                srchTimeWin: PropTypes.number,
                srchJobsQuota: PropTypes.number,
                rtSrchJobsQuota: PropTypes.number,
                cumulativeSrchJobsQuota: PropTypes.number,
                cumulativeRTSrchJobsQuota: PropTypes.number,
                imported_capabilities: PropTypes.arrayOf(PropTypes.string),
                imported_srchFilter: PropTypes.string,
                srchDiskQuota: PropTypes.number,
                srchIndexesDefault: PropTypes.arrayOf(PropTypes.string),
                srchIndexesAllowed: PropTypes.arrayOf(PropTypes.string),
                federatedProviders: PropTypes.arrayOf(PropTypes.string),
            }),
        }).isRequired,
        apps: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
        application: PropTypes.shape({
            root: PropTypes.string,
            locale: PropTypes.string,
            app: PropTypes.string,
        }).isRequired,
        objectNameSingular: PropTypes.string.isRequired,
        nameAttribute: PropTypes.string.isRequired,
        handleRequestClose: PropTypes.func.isRequired,
        callCreateRole: PropTypes.func.isRequired,
        callEditRole: PropTypes.func.isRequired,
        fetchAllCapabilities: PropTypes.func.isRequired,
        fetchAllRoles: PropTypes.func.isRequired,
        fetchAllFederatedProviders: PropTypes.func.isRequired,
        setShouldRefreshOnClose: PropTypes.func.isRequired,
        shouldShowFederatedProviders: PropTypes.bool.isRequired,
        learnMoreLink: PropTypes.string.isRequired,
    };

    constructor(props, context) {
        super(props, context);
        this.indexListSearchJob = Utils.createSearchJob();
        // This variable is used to re-compute selected indexes to get fields in the restrictions tab.
        this.idxChanged = true;
        // This variable is used to compute selected capabilities in the capabilities tab.
        this.inheritedRoleChanged = false;
        this.model = {
            fieldSearch: new IndexFieldValues(),
            valueSearch: new IndexFieldValues(),
        };
        // Debounce calls to fetch fields and values
        this.getFieldsDebounced = debounce(this.getFields, 300);
        this.getValuesDebounced = debounce(this.getValues, 300);
        // Debounce updateGenSrchFilter function. See SPL-174908
        this.updateGenSrchFilterDebounced = debounce(this.updateGenSrchFilter, 700);
        this.addEditModalRef = React.createRef();
        this.state = {
            /** Boolean indicating whether the page is working (saving, deleting, ...). Used to disable button. */
            isWorking: false,
            /** String containing the error message, if any */
            errorMessage: '',
            /** Object maintaining all the properties under the resources tab */
            resources: {
                srchFilter: this.props.object.content ? this.props.object.content.srchFilter : '',
                srchTimeWin: this.props.object.content ? this.props.object.content.srchTimeWin.toString() : '-1',
                srchJobsQuota: this.props.object.content ? this.props.object.content.srchJobsQuota.toString() : '3',
                rtSrchJobsQuota: this.props.object.content ? this.props.object.content.rtSrchJobsQuota.toString() : '6',
                cumulativeSrchJobsQuota: this.props.object.content ?
                    this.props.object.content.cumulativeSrchJobsQuota.toString() : '0',
                cumulativeRTSrchJobsQuota: this.props.object.content ?
                    this.props.object.content.cumulativeRTSrchJobsQuota.toString() : '0',
                srchDiskQuota: this.props.object.content ? this.props.object.content.srchDiskQuota.toString() : '100',
                federatedProviders: this.props.object.content
                    && this.props.object.content.federatedProviders
                    && this.props.object.content.federatedProviders[0]
                    ? this.props.object.content.federatedProviders[0].split(',')
                    : [],
            },
            /** Array of capabilities with UI specific properties */
            selectedCaps: [],
            /** Array of indices with UI specific properties */
            indexes: [],
            /** Array of all the roles (entire list) */
            roles: [],
            /** Dropdown menu selection in inheritance and capabilities */
            menuSelectionState: {
                roles: 'all',
                selectedCaps: 'all',
                indexes: 'all',
            },
            /** Title of the role */
            title: this.props.action !== 'clone'
                   ? this.props.object[this.props.nameAttribute] || ''
                   : sprintf('%s%s', this.props.object[this.props.nameAttribute], '_clone'),
            /** Default app for the role */
            defaultApp: this.props.object.content ? this.props.object.content.defaultApp : '',
            /** maintains the currently active tab */
            activePanelId: 'inheritance',
            /** Default concat option in Restrictions tab */
            concatOpt: Utils.DEFAULT_CONCAT_OPT,
            /** List of selected index name strings  */
            indexList: [],
            /** List of indexed fields present in indexes selected in the indexes tab */
            idxFields: [],
            /** Name of selected idxField being searched on for it's values */
            idxFieldSelected: '',
            /** Array of field values corresponding to selected idxField */
            idxFieldVals: [],
            /** Array of selected field values corresponding to selected idxField */
            idxFieldValSelected: [],
            /** Time modifier str controlling size of search to populate field/val components */
            srchTimerange: Utils.DEFAULT_TIMERANGE,
            /** srchFilter generated from the GUI */
            generatedSrchFilter: '',
            /** show federated providers if users have fsh_manage or DFS license */
            federatedProviders: [],
            /** scroll container for modal dropdowns */
            scrollContainer: 'window',
            tabFilterState: {
                roles: '',
                indexes: '',
                selectedCaps: '',
            },
            /** Wildcard text input in indexes tabpanel */
            wildcardText: '',
            /** Name of last created wildcard used in confirmation msg */
            wildcardSuccess: '',
        };
    }

    componentDidMount() {
        /** Get all the federated providers to populate the multiselect */
        if (this.props.shouldShowFederatedProviders) {
            this.props.fetchAllFederatedProviders(Utils.getFederationsUrl())
            .then((res) => {
                const federatedProviders = Utils.getProvidersName(res.entry);
                this.setState({ federatedProviders });
            })
            .catch(res => this.setState({ errorMessage: res.message, federatedProviders: [] }));
        }
        /** Get all the roles to populate the inheritance tab */
        this.props.fetchAllRoles(Utils.getRolesUrl())
            .then((res) => {
                const roles = Utils.getRolesWithSelection(res.entry, this.props.object);
                this.setState({ roles });
            })
            .catch(res => this.setState({ errorMessage: res.message }));
        /** Get all the capabilities to populate the capabilities tab */
        this.props.fetchAllCapabilities(Utils.getCapabilitiesUrl())
            .then((res) => {
                const caps = res.entry[0].content.capabilities;
                const selectedCaps = Utils.getCapsWithSelection(caps, this.props.object);
                this.setState({ selectedCaps });
            })
            .catch(res => this.setState({ errorMessage: res.message }));
        this.searchIndexes();
    }

    componentDidUpdate = (prevProps, prevState) => {
        /** If there was a change to srchFilter generator formdata in Restrictions tab,
        we generate and re-render the preview */
        if (prevState.concatOpt !== this.state.concatOpt
            || prevState.idxFieldSelected !== this.state.idxFieldSelected
            || prevState.idxFieldValSelected.length !== this.state.idxFieldValSelected.length) {
            this.updateGenSrchFilterDebounced();
        }
        if (this.inheritedRoleChanged) {
            // SPL-177390: Get all imported capabilities whenever a user selects/deselects a role in
            // the inheritance tab
            this.inheritedRoleChanged = false;
            let importedCaps;
            let importedInds;
            if (this.state.roles.length > 0) {
                const importedProps = Utils.getImportedProps(this.state.roles);
                importedInds = has(importedProps, 'ind') && importedProps.ind;
                importedCaps = has(importedProps, 'caps') && importedProps.caps;
            } else if (this.props.object && this.props.object.content &&
                this.props.object.content.imported_capabilities) {
                importedCaps = new Set(this.props.object.content.imported_capabilities);
            }
            // Update all state cap objs
            const selectedCaps = Utils.updateCaps([...this.state.selectedCaps], importedCaps,
                this.state.menuSelectionState.selectedCaps);

            const indexes = Utils.getIndexPreview(importedInds, this.state.indexes,
                this.state.menuSelectionState.indexes);
            this.setState({ selectedCaps, indexes });
        }
        if (this.state.wildcardSuccess.length > 0 && prevState.wildcardSuccess === this.state.wildcardSuccess) {
            this.setState({ wildcardSuccess: '' });
        }
    }

    componentWillUnmount = () => {
        if (this.indexSearchJobResults) {
            this.indexSearchJobResults.unsubscribe();
        }
        if (this.indexesAllowedSearchJobResults) {
            this.indexesAllowedSearchJobResults.unsubscribe();
        }
        if (this.valueResults) {
            this.valueResults.unsubscribe();
        }
        if (this.fieldResults) {
            this.fieldResults.unsubscribe();
        }
    }

    /**
     * Creates a search job to get the fields for the selected indices using the fieldSearch
     * model and ensures there is only one fields search at a time.
     */
    getFields = () => {
        if (this.fieldResults) {
            this.fieldResults.unsubscribe();
        }
        this.model.fieldSearch.options.earliest_time = this.state.srchTimerange;
        this.model.fieldSearch.options.type = 'field';
        this.setState({
            isWorking: true,
        });
        this.fieldResults = this.model.fieldSearch.getFields().getResults().subscribe({
            next: this.handleGetFieldsNext,
            error: this.handleGetFieldsErr,
            complete: this.handleComplete,
        });
    }

    /**
     * Creates a search job to get the field values for the selected field using the valueSearch
     * model and ensures there is only one values search at a time.
     */
    getValues = (filter = '') => {
        if (this.valueResults) {
            this.valueResults.unsubscribe();
        }
        this.model.valueSearch.options.earliest_time = this.state.srchTimerange;
        this.model.valueSearch.options.type = this.state.idxFieldSelected;
        if (filter) {
            this.model.valueSearch.options.valueFilter = filter;
        } else {
            this.model.valueSearch.options.valueFilter = '';
        }
        this.setState({
            isWorking: true,
        });
        this.valueResults = this.model.valueSearch.getValues().getResults().subscribe({
            next: this.handleGetValuesNext,
            error: this.handleGetValuesErr,
            complete: this.handleComplete,
        });
    }


    searchIndexes = () => {
        const { object: currentRole } = this.props;
        /** Get the list of local and remote indexes from the search job results. */
        this.indexSearchJobResults = this.indexListSearchJob.getResults &&
            this.indexListSearchJob
            .getResults({ count: 1000 })
            .subscribe(({ results: indexes = [] }) => {
                const setSelectedIndexes = (remainingAllowedIndexes = []) => {
                    // Create indexes data structure and store it in state.
                    const indexesWithSelectionState = Utils.getSelectedIndexes(
                        [...indexes, ...remainingAllowedIndexes],
                        currentRole,
                    );
                    // SPL-174622: Update the indexes list in the fieldVals model.
                    this.updateIndexList(indexesWithSelectionState);
                    this.setState({
                        indexes: indexesWithSelectionState,
                    });
                };

                // SPL-185600:
                // Build a list of remaining index names that need to be loaded into the UI, and then load them.
                // This will happen when there are any indexes which have been previously allowed within the
                // currentRole, but those indexes were not loaded due to capping the indexSearchJobResults and/or
                // getResults calls to a lower number of results than exists locally/remotely. As this component's
                // logic is currently constructed, if we don't load the remaining indexes and the role is saved as
                // an update, then access is revoked from those remaining indexes.
                const indexMap = keyBy(indexes, 'index');
                const allowedIndexNames = Utils.getAllowedIndexNamesFromRole(this.props.object);
                const remainingIndexNamesToSearch = allowedIndexNames.reduce((accum, indexName) => {
                    if (!indexMap[indexName] && !Utils.isWildcard(indexName)) {
                        accum.push(indexName);
                    }
                    return accum;
                }, []);
                if (remainingIndexNamesToSearch.length) {
                    this.indexesAllowedSearchJob = Utils.createSpecificIndexesSearchJob(remainingIndexNamesToSearch);
                    this.indexesAllowedSearchJobResults = this.indexesAllowedSearchJob.getResults &&
                        this.indexesAllowedSearchJob
                            .getResults({ count: remainingIndexNamesToSearch.length })
                            .subscribe(({ results }) => setSelectedIndexes(results));
                } else {
                    setSelectedIndexes();
                }
            });
    }

    /**
     * Next handler for the observable in getFields.
     * @param {Object}: results of field search
     */
    handleGetFieldsNext = (results) => {
        if (results.results && results.results.length) {
            this.setState({
                idxFields: results.results,
            });
        }
    }

    /**
     * Error handler for the observable in getFields.
     * @param {Object}: Error object returned from failed field search
     */
    handleGetFieldsErr = (err) => {
        this.model.fieldSearch.errorMsg = err.message;
        this.setState({
            isWorking: false,
        });
    }

    /**
     * Next handler for the observable in getValues.
     * @param {Object}: results of values search
     */
    handleGetValuesNext = (results) => {
        if (results.results && results.results.length) {
            this.setState({
                idxFieldVals: results.results,
            });
        }
    }

    /**
     * Error handler for the observable in getValues.
     * @param {Object}: Error object returned from failed values search
     */
    handleGetValuesErr = (err) => {
        this.model.valueSearch.errorMsg = err.message;
        this.setState({
            isWorking: false,
        });
    }

    /**
     * Complete handler for the observable in getFields & getValues.
     */
    handleComplete = () => {
        this.setState({
            isWorking: false,
        });
    }

    /**
     * Updates generateds srchFilter preview in restrictions tab.
     */
    updateGenSrchFilter = () => {
        this.setState({
            generatedSrchFilter: Utils.genSrchFilter(this.state.resources.srchFilter, this.state.concatOpt,
                this.state.idxFieldSelected, this.state.idxFieldValSelected),
        });
    }

    /**
     * Preview the search results for the srchFilter.
     */
    handlePreviewSrchFilter = () => {
        this.previewSearchFilterStr = '';
        const listLen = this.model.fieldSearch.options.indexList.length;

        if (listLen) {
            this.model.fieldSearch.options.indexList.forEach((index, i) => {
                this.previewSearchFilterStr += (i === listLen - 1) ? `index=${index}` : `index=${index} OR `;
            });
            this.previewSearchFilterStr += this.state.resources.srchFilter.length ?
                ` | search ${this.state.resources.srchFilter}` : '';
            this.previewSearchFilterStr += this.props.object.content && this.props.object.content.imported_srchFilter ?
                ` | search ${this.props.object.content.imported_srchFilter}` : '';
        }

        const routeString = route.search(
            this.props.application.root,
            this.props.application.locale,
            this.props.application.app,
            {
                data: {
                    earliest: '-60s',
                    latest: 'now',
                    q: this.previewSearchFilterStr,
                },
            });
        if (this.previewSearchFilterStr) {
            window.open(routeString, '_blank');
        }
    }

    /**
     * Success handler to be called when the roles collection fetch call completes successfully.
     */
    handleSuccess = () => {
        this.props.setShouldRefreshOnClose();
        this.handleClose();
    };

    /**
     * Handles the toggle of roles in inheritance tab.
     * @param {Event} event
     * @param {String} name of the role to be toggled.
     */
    handleRolesToggle = (event, { name }) => {
        // Re-compute inherited capabilities in capabilities tab by setting inheritedRoleChanged = true
        this.inheritedRoleChanged = true;
        this.setState({
            roles: Utils.toggleSelected([...this.state.roles], { name }),
        });
    };

    /**
     * Handles the toggleAll selection for roles in inheritance tab.
     */
    handleRolesToggleAll = () => {
        // Re-compute inherited capabilities in capabilities tab by setting inheritedRoleChanged = true
        this.inheritedRoleChanged = true;
        this.setState({
            roles: Utils.toggleAll(this.state.roles),
        });
    };

    /**
     * Handles toggling of capabilities in the capabilities tab.
     * @param {Event} event
     * @param {String} name of the capability to be toggled.
     */
    handleCapsToggle = (event, { name }) => {
        this.setState({
            selectedCaps: Utils.toggleSelected([...this.state.selectedCaps], { name }),
        });
    };

    /**
     * Handles the toggleAll selection for capabilities in the capabilities tab.
     */
    handleCapsToggleAll = () => {
        this.setState({
            selectedCaps: Utils.toggleAll(this.state.selectedCaps),
        });
    };

    /**
     * Handles toggling of Indexes in the Indexes tab.
     * @param {Event} event
     * @param {String} value - name of the index to be toggled.
     */
    handleIndexesToggle = (event, { value }) => {
        this.idxChanged = true;
        this.setState({
            indexes: Utils.toggleSelected([...this.state.indexes], value),
        });
    };

    /**
     * Handles filtering of items based on dropdown menu selection in the Inheritance, Capabilities and Indexes tab.
     * @param {Object}
     * data = {
     *    name {string} required: <type of filtering>,
     *    value {string} [optional]: <value of the filter>
     * }.
     * @param {String} stateVar - The name of the corresponding state variable used to store the item.
     * (selectedCaps, indexes, roles)
     */
    handleTabPanelFiltering = (data, stateVar) => {
        const updatedState = {
            menuSelectionState: this.state.menuSelectionState,
            tabFilterState: this.state.tabFilterState,
        };
        // If data.name === 'name', we use an empty string as the menuSelection label
        updatedState.menuSelectionState[stateVar] = data.name === 'name' ? '' : data.name;
        // data.value is undefined whenever the dropdown filter is being used.
        // In this scenario, we will clear the tabFilter state by setting to empty str.
        updatedState.tabFilterState[stateVar] = data.value === undefined ? '' : data.value;
        // Update the stateVar data structure based on filter options.
        updatedState[stateVar] = Utils.filterData(this.state[stateVar], stateVar, data.name,
            updatedState.tabFilterState[stateVar]);

        this.setState(updatedState);
    }

    /**
     * Handler for create/edit role.
     */
    handleSave = () => {
        this.setState({
            isWorking: true,
        });

        switch (this.props.action) {
            case 'new':
            case 'clone': {
                const data = {
                    name: this.state.title.trim(),
                    defaultApp: this.state.defaultApp,
                    output_mode: 'json',
                };
                this.props.callCreateRole(Utils.constructPostData(data, this.state))
                    .then(() => {
                        this.handleSuccess();
                    })
                    .catch((response) => {
                        this.setState({
                            isWorking: false,
                            errorMessage: response.message,
                        });
                        this.addEditModalRef.current.scrollIntoView();
                    });
                break;
            }
            case 'edit': {
                const data = {
                    defaultApp: this.state.defaultApp,
                    output_mode: 'json',
                };
                this.props.callEditRole(this.props.object.name, Utils.constructPostData(data, this.state))
                    .then(() => {
                        this.handleSuccess();
                    })
                    .catch((response) => {
                        this.setState({
                            isWorking: false,
                            errorMessage: response.message,
                        });
                        this.addEditModalRef.current.scrollIntoView();
                    });
                break;
            }
            default:
                break;
        }
    };

    /**
     * Handler for modal close action.
     */
    handleClose = () => {
        this.setState({
            isWorking: false,
            errorMessage: '',
        });
        this.props.handleRequestClose();
    };

    /**
     * Handles role title change
     * @param {Event} e
     * @param {String} value
     */
    handleTitleTextChange = (e, { value }) => {
        this.setState({
            title: value,
        });
    };

    /**
     * Handles any property change under resources tab
     * @param {Event} e
     * @param {String} name - name of the property
     * @param {String} value - value of the property
     * @param {String} values - values of the selected federated providers
     */
    handleResourceChange = (e, { name, value, values }) => {
        const updatedState = { resources: this.state.resources };
        updatedState.resources[name] = value;
        if (name === 'srchFilter') {
            updatedState.generatedSrchFilter = Utils.genSrchFilter(value, this.state.concatOpt,
                this.state.idxFieldSelected, this.state.idxFieldValSelected);
        }
        if (name === 'federatedProviders') {
            updatedState.resources[name] = values;
        }
        this.setState(updatedState);
    };

    /**
     * Handles defaultApp selection
     * @param {Event} e
     * @param {String} value
     */
    handleAppChange = (e, { value }) => {
        this.setState({
            defaultApp: value,
        });
    };

    /**
     * Handles concat option in Restrictions tab
     * @param {Event} e
     * @param {String} value
     */
    handleConcatOpt = (e, { value }) => {
        this.setState({ concatOpt: value });
    }

    /**
     * Handles field selection in Restrictions tab. Runs search for the selected
     * field's values
     * @param {Event} e
     * @param {String} value
     */
    handleFieldChange = (e, { value }) => {
        if (value) {
            this.setState({
                idxFieldSelected: value,
                idxFieldValSelected: [],
            }, this.getValuesDebounced());  // Get value for the selected field.
        } else {
            // Handle scenario when no field is selected by clearing any previous values fetched
            this.setState({
                idxFieldValSelected: [],
                idxFieldSelected: '',
            });
        }
    };

    /**
     * Handles value selection in Restrictions tab
     * @param {Event} e
     * @param {String} value
     */
    handleValueChange = (e, { values }) => {
        this.setState({ idxFieldValSelected: values });
    };

     /**
      * Handles timerange selection in Restrictions tab
      * @param {Event} e
      * @param {String} value
      */
    handleSrchTimerangeChange = (e, { value }) => {
        // Clear form data when timerange changes
        this.setState({
            srchTimerange: value,
            idxFieldValSelected: [],
            idxFieldVals: [],
            idxFieldSelected: '',
            idxFields: [],
        }, this.getFieldsDebounced());
    };

    /**
     * Handles apply btn in Restrictions tab
     */
    handleApplyClick = () => {
        const resources = this.state.resources;
        resources.srchFilter += this.state.generatedSrchFilter;
        this.setState({
            resources,
            idxFieldValSelected: [],
            idxFieldVals: [],
            idxFieldSelected: '',
        });
    }

    /**
     * Does a prefix search for getting the index field values in the Restrictions tab.
     * @param {Event} e
     * @param {string} keyword - the data entered in the filter
     */
    handleValueFilter = (e, { keyword }) => {
        this.getValuesDebounced(keyword);
    }

    /**
     * Handles reset button in the Restrictions tab
     */
    handleResetClick = () => {
        this.setState({
            concatOpt: Utils.DEFAULT_CONCAT_OPT,
            idxFields: [],
            idxFieldVals: [],
            idxFieldSelected: '',
            idxFieldValSelected: [],
            srchTimerange: Utils.DEFAULT_TIMERANGE,
        });
    }

    /**
     * Handle the tab change event
     * @param {Event} e
     * @param {object} data
     */
    handleTabChange = (e, data) => {
        const tabState = { activePanelId: data.activePanelId };
        if (data.activePanelId === 'restrictions') {
            // If the index list was updated, clear idxField and idxFieldVal state vars and
            // rerun the field search
            if (this.idxChanged) {
                this.idxChanged = false;
                Object.assign(tabState, {
                    idxFields: [],
                    idxFieldVals: [],
                    idxFieldSelected: '',
                    idxFieldValSelected: [],
                });
                this.updateIndexList(this.state.indexes);
                this.getFieldsDebounced();
            }
        }
        this.setState(tabState);
    };

    /**
     * Update the index list in the field and value models.
     */
    updateIndexList = (indexes) => {
        const indexList = indexes.reduce((idxList, idx) => {
            if (idx.imported_srchDefault || idx.imported_srchAllowed || idx.srchDefault
                || idx.srchAllowed || idx.isIncPreview || idx.isDefPreview) {
                idxList.push(idx.name);
            }
            return idxList;
        }, []);
        this.model.fieldSearch.options.indexList = indexList;
        this.model.valueSearch.options.indexList = indexList;
    };

    /**
     * elementRef callback used for modal scrollContainer. Re: SPL-176166
     */
    handleMount = el => this.setState({ scrollContainer: el });

    handleWildcardTextChange = (e, { value }) => {
        this.setState({ wildcardText: value });
    }

    /**
     * Handler for create wildcard btn in indexes tabpanel
     */
    handleAddWildcard = () => {
        let indexes = [...this.state.indexes];
        let errorMessage;
        if (this.state.wildcardText === '') {
            errorMessage = _('You must enter a value in the Wildcard text box.');
        } else if (this.state.wildcardText === '*') {
            errorMessage = _('Use the index selection "All non-internal indexes" in the Indexes table instead of "*".');
        } else if (this.state.wildcardText === '_*') {
            errorMessage = _('Use the index selection "All internal indexes" in the Indexes table instead of "_*".');
        } else if (!Utils.isWildcard(this.state.wildcardText)) {
            errorMessage = _('Enter a wildcard name containing "*".');
        } else if (!Utils.isValidIdxName(this.state.wildcardText)) {
            errorMessage = _(
              'Index names can only contain lower case letters, numbers, underscores, or hyphens.' +
              ' Index names cannot start with a hyphen.');
        } else {
            indexes.forEach((idx) => {
                if (idx.name === this.state.wildcardText) {
                    errorMessage = _(`The wildcard "${this.state.wildcardText}" already exists.`);
                }
            });
        }

        if (errorMessage) {
            this.setState({ errorMessage });
        } else {
            let wildcard = {
                name: this.state.wildcardText,
                filtered: true,
                srchDefault: false,
                srchAllowed: true,
                isWildcard: true,
                isNew: true,
            };
            // Select and disable all indexes covered by wildcard
            wildcard = Utils.selectCoveredIndexes(wildcard, indexes, true);
            indexes = Utils.sortByKey([...indexes, wildcard], 'name');
            this.setState({
                indexes,
                wildcardSuccess: wildcard.name,
                wildcardText: '',
                errorMessage: '',
            });
        }
    }

    render() {
        const apps = this.props.apps.map(model => ({ value: model.entry.get('name') }));
        const disableConcat = this.state.resources.srchFilter.trim().length === 0
            || this.state.idxFieldValSelected.length === 0;
        return (
            <Modal
                onRequestClose={this.handleClose}
                data-test-name="add-edit-role-modal"
                open={this.props.open}
                style={{ width: '75%' }}
            >
                <Modal.Header
                    title={sprintf('%s %s %s', Utils.getModalTitle(this.props.action),
                    this.props.objectNameSingular, this.props.object[this.props.nameAttribute] || '')}
                    data-test-name="add-edit-role-modal-header"
                    onRequestClose={this.handleClose}
                />
                <Modal.Body data-test-name="add-edit-role-modal-body" elementRef={this.handleMount}>
                    <div ref={this.addEditModalRef}>
                        {this.state.errorMessage && (
                            <Message
                                type="error"
                                data-test-name="add-edit-role-modal-err-msg"
                                elementRef={Utils.scrollToRef}
                            >
                                {this.state.errorMessage}
                            </Message>
                        )}
                        <ControlGroup
                            label={_('Name *')}
                            data-test-name="add-edit-role-name-cg"
                            tooltip={NEW_ROLE_ACTIONS.indexOf(this.props.action) === -1
                                ? _('You cannot edit the name of an existing role.')
                                : _('A role must have a name.')}
                        >
                            <Text
                                data-test-name="add-edit-role-name-title"
                                canClear
                                autoFocus
                                disabled={NEW_ROLE_ACTIONS.indexOf(this.props.action) === -1}
                                value={this.state.title}
                                onChange={this.handleTitleTextChange}
                            />
                        </ControlGroup>
                        <TabLayout
                            style={{ margin: 35 }}
                            data-test-name="add-edit-role-modal-tabs"
                            activePanelId={this.state.activePanelId}
                            onChange={this.handleTabChange}
                        >
                            <TabLayout.Panel label={_('1. Inheritance')} panelId="inheritance" style={{ margin: 20 }}>
                                <InheritancePanel
                                    roles={this.state.roles}
                                    menuSelected={this.state.menuSelectionState.roles}
                                    handleRolesFiltering={this.handleTabPanelFiltering}
                                    rowRolesSelectionState={Utils.rowRolesSelectionState}
                                    handleRolesToggleAll={this.handleRolesToggleAll}
                                    handleRolesToggle={this.handleRolesToggle}
                                    filterValue={this.state.tabFilterState.roles}
                                />
                            </TabLayout.Panel>
                            <TabLayout.Panel label={_('2. Capabilities')} panelId="capabilities" style={{ margin: 20 }}>
                                <CapabilitiesPanel
                                    caps={this.state.selectedCaps}
                                    menuSelected={this.state.menuSelectionState.selectedCaps}
                                    rowRolesSelectionState={Utils.rowRolesSelectionState}
                                    handleCapsToggleAll={this.handleCapsToggleAll}
                                    handleCapsToggle={this.handleCapsToggle}
                                    handleCapsFiltering={this.handleTabPanelFiltering}
                                    filterValue={this.state.tabFilterState.selectedCaps}
                                />
                            </TabLayout.Panel>
                            <TabLayout.Panel label={_('3. Indexes')} panelId="indexes" style={{ margin: 20 }}>
                                <IndexesPanel
                                    indexes={this.state.indexes}
                                    handleIndexesToggle={this.handleIndexesToggle}
                                    handleIndexFiltering={this.handleTabPanelFiltering}
                                    menuSelected={this.state.menuSelectionState.indexes}
                                    filterValue={this.state.tabFilterState.indexes}
                                    handleWildcardTextChange={this.handleWildcardTextChange}
                                    wildcardText={this.state.wildcardText}
                                    handleAddWildcard={this.handleAddWildcard}
                                    wildcardSuccess={this.state.wildcardSuccess}
                                />
                            </TabLayout.Panel>
                            <TabLayout.Panel label={_('4. Restrictions')} panelId="restrictions">
                                <RestrictionsPanel
                                    concatOpt={this.state.concatOpt}
                                    disableConcat={disableConcat}
                                    generatedSrchFilter={this.state.generatedSrchFilter}
                                    handleApplyClick={this.handleApplyClick}
                                    handleConcatOpt={this.handleConcatOpt}
                                    disableGenerator={this.model.fieldSearch.options.indexList.length === 0}
                                    handleFieldChange={this.handleFieldChange}
                                    handlePreviewSrchFilter={this.handlePreviewSrchFilter}
                                    handleResetClick={this.handleResetClick}
                                    handleResourceChange={this.handleResourceChange}
                                    handleSrchTimerangeChange={this.handleSrchTimerangeChange}
                                    handleValueChange={this.handleValueChange}
                                    handleValueFilter={this.handleValueFilter}
                                    idxFields={this.state.idxFields}
                                    idxFieldSelected={this.state.idxFieldSelected}
                                    idxFieldVals={this.state.idxFieldVals}
                                    idxFieldValSelected={this.state.idxFieldValSelected}
                                    isWorking={this.state.isWorking}
                                    learnMoreLink={this.props.learnMoreLink}
                                    srchFilter={this.state.resources.srchFilter}
                                    srchTimerange={this.state.srchTimerange}
                                    srchTimeWin={this.state.resources.srchTimeWin}
                                    scrollContainer={this.state.scrollContainer}
                                />
                            </TabLayout.Panel>
                            <TabLayout.Panel
                                label={_('5. Resources')}
                                panelId="resources"
                                style={{ margin: 20 }}
                            >
                                <ResourcePanel
                                    apps={apps}
                                    defaultApp={this.state.defaultApp}
                                    handleAppChange={this.handleAppChange}
                                    resources={this.state.resources}
                                    handleResourceChange={this.handleResourceChange}
                                    handleSrchTimeWinChange={this.handleSrchTimeWinChange}
                                    handleSelect={this.handleSelect}
                                    federatedProviders={this.state.federatedProviders}
                                    shouldShowFederatedProviders={this.props.shouldShowFederatedProviders}
                                    scrollContainer={this.state.scrollContainer}
                                />
                            </TabLayout.Panel>
                        </TabLayout>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        data-test-name={'cancel-btn'}
                        onClick={this.handleClose}
                        label={_('Cancel')}
                    />
                    <Button
                        appearance="primary"
                        data-test-name={'save-btn'}
                        disabled={this.state.isWorking}
                        onClick={this.handleSave}
                        label={Utils.getButtonLabel(this.state.isWorking, this.props.action)}
                    />
                </Modal.Footer>
            </Modal>
        );
    }
}

export default AddEditRoles;
