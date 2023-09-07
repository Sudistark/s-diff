import { _ } from '@splunk/ui-utils/i18n';
import { find, union, has } from 'lodash';
import SearchJob from '@splunk/search-job';
import querystring from 'querystring';
import { createRESTURL } from '@splunk/splunk-utils/url';
import { sprintf } from '@splunk/ui-utils/format';

export const ROLES_COLLECTION_PATH = createRESTURL('authorization/roles');
export const CAPABILITIES_COLLECTION_PATH = createRESTURL('authorization/grantable_capabilities');
export const FEDERATIONS_COLLECTION_PATH = createRESTURL('dfs/federated');
export const MAX_FILTER_LENGTH = 250;
export const DEFAULT_TIMERANGE = '-60s';
export const DEFAULT_TIMERANGE_LABEL = '60 seconds';
export const DEFAULT_CONCAT_OPT = 'OR';
export const WARN_MSG_FIELD_COLLISION = 'The indexed field "%(field)s" that you selected already exists' +
    ' in the SPL search filter. Confirm that the filter has no unintended conflicts in SPL.';
export const WARN_MSG_CONTAINS_EQUALS = 'The SPL search filter contains search terms that use the "="' +
    ' operator. For event data, this type of syntax is not secure, use the "::" operator instead. You' +
    ' can safely use "=" in search terms for metrics data.';

/**
 * Function that returns the index names of those selected within the given role.
 * @param {object} role - current role object being created/edited.
 * @returns {[String]} - Array of index names
 */
export function getAllowedIndexNamesFromRole(role) {
    let indexNames = [];
    if (role && role.content) {
        indexNames = union(
            role.content.srchIndexesAllowed,
            role.content.imported_srchIndexesAllowed,
            role.content.srchIndexesDefault,
            role.content.imported_srchIndexesDefault,
        );
    }
    return indexNames;
}

/**
 * Function that returns if source of a capability is native to that role or if it is inherited.
 * @param cap - String. Name of the capability
 * @param role - Object. Current role
 * @returns {String}
 */
export function getCapSource(cap, role) {
    if (role && role.content) {
        if (role.content.imported_capabilities && role.content.imported_capabilities.indexOf(cap) > -1) {
            return _('inherited');
        } else if (role.content.capabilities && role.content.capabilities.indexOf(cap) > -1) {
            return _('native');
        }
        return '';
    }
    return '';
}
/**
 * Create a search job to get all the local and remote indexes.
 * @returns {SearchJob}
 */
export function createSearchJob() {
    return SearchJob.create({
        search: '| eventcount summarize=false index=* index=_* | dedup index | head 1000',
    });
}
/**
 * Create a search job to get only the indexes matching the provided index names
 * @param indexNames - [String] an array of index names used to fetch the corresponding indexes.
 * @returns {SearchJob}
 */
export function createSpecificIndexesSearchJob(indexNames) {
    return SearchJob.create({
        search: `| eventcount summarize=false ${indexNames.map(i => `index=${i}`).join(' ')} | fields + index`,
    });
}
/**
 * Function that returns roles with filtered and selected flag to be used under
 * Inheritance tab in the add/edit roles dialog.
 * @param roles - Array of roles fetched from authorization/roles
 * @param currentRole - current role object being created/edited.
 * @returns {[objects]} - Array of roles objects
 */
export function getRolesWithSelection(roles, currentRole) {
    return roles && roles.map(role => ({
        name: role.name,
        filtered: true,
        selected: (currentRole && currentRole.content &&
            currentRole.content.imported_roles.indexOf(role.name) > -1),
        capabilities: (role && role.content && role.content.capabilities && role.content.imported_capabilities &&
            role.content.capabilities.concat(role.content.imported_capabilities)),
        defIndLis: (role && role.content && role.content.srchIndexesDefault &&
            role.content.imported_srchIndexesDefault &&
            role.content.srchIndexesDefault.concat(role.content.imported_srchIndexesDefault)),
        incIndLis: (role && role.content && role.content.srchIndexesAllowed &&
            role.content.imported_srchIndexesAllowed &&
            role.content.srchIndexesAllowed.concat(role.content.imported_srchIndexesAllowed)),
    }));
}
/**
 * Function that returns existing providers' names
 * Inheritance tab in the add/edit roles dialog.
 * @param providers - Array of federated providers fetched from dfs/federated
 * @returns {[String]} - Array of string
 */
export function getProvidersName(providers) {
    return providers.map(provider => provider.name);
}
/**
 * Function that finds and sets capabilties and indexes that are imported
 * @param roles - Array of role objects
 * @returns {Set} - Set of imported capabilities for all roles that are selected
 */
export function getImportedProps(roles) {
    const def = new Set();
    const inc = new Set();
    const caps = new Set();
    // Get all capabilities and indexes for roles selected and remove duplicate capabilities
    roles.forEach((role) => {
        if (role.selected) {
            if (has(role, 'defIndLis')) {
                role.defIndLis.forEach(ind => def.add(ind));
            }
            if (has(role, 'incIndLis')) {
                role.incIndLis.forEach(ind => inc.add(ind));
            }
            role.capabilities.forEach(cap => caps.add(cap));
        }
    });
    return ({
        caps,
        ind: { def, inc },
    });
}

/**
 * Function that converts index wildcard string into RegExp object.
 * @param {String} wildcard - wildcard name string
 * @returns {RegExp} - matching regex object
 */
export function createWildcardRegex(wildcard) {
    return new RegExp(sprintf('^%s$', wildcard.replace(/\*/gi, '([\\w-*]*)')), 'i');
}

/**
  * Function parses through array of Capability objects and updates the source and/or
  * selected attributes
  * @param caps - Array of capability objects
  * @param importedCaps - Set of imported capabilities for all roles that are selected
  * @returns Updated array of capability objects
*/
export function updateCaps(caps, importedCaps, selection) {
    const updatedCapsList = caps.map((cap) => {
        const updatedCap = { ...cap };
        updatedCap.isPreview = importedCaps.has(cap.name);
        if (!updatedCap.isPreview && cap.source === 'inherited') {
            // When unselecting an inherited role containing a capability that is also in the
            // active role, we must reset source and selected.
            updatedCap.source = '';
            updatedCap.selected = false;
        }
        switch (selection) {
            case 'selected':
                updatedCap.filtered = updatedCap.isPreview || updatedCap.selected;
                break;
            case 'unselected':
                updatedCap.filtered = !updatedCap.isPreview && !updatedCap.selected;
                break;
            case 'native':
                updatedCap.filtered = (updatedCap.source === 'native' || updatedCap.source === '') &&
                    !updatedCap.isPreview && updatedCap.selected;
                break;
            case 'inherited':
                updatedCap.filtered = updatedCap.isPreview || updatedCap.source === 'inherited';
                break;
            default:
                updatedCap.filtered = true;
        }
        return updatedCap;
    });
    return updatedCapsList;
}

/**
 * Function iterates over lists of indexes and adds wildcard name to covered indexes
 * @param wildcard - Index object with current wildcard
 * @param indexes - list of index objects to iterate over
 * @param newWildcard - Boolean indicating if wildcard needs to check for it's own wildcard list
 * @returns updated wildcard index object
 */
export function selectCoveredIndexes(wildcard, indexes, newWildcard) {
    const regex = createWildcardRegex(wildcard.name);
    const changedWildcard = wildcard;
    indexes.map((idx) => {
        const index = idx;
        index.name = index.name || index.index;
        if (newWildcard && index.isWildcard) {
            const indexRegex = createWildcardRegex(index.name);
            if (indexRegex.test(wildcard.name)) {
                if (index.srchDefault || index.imported_srchDefault || index.isDefPreview) {
                    changedWildcard.wildcard_srchDefault = [index.name].concat(
                        changedWildcard.wildcard_srchDefault || []);
                }
                if (index.srchAllowed || index.imported_srchAllowed || index.isIncPreview) {
                    changedWildcard.wildcard_srchAllowed = [index.name].concat(
                        changedWildcard.wildcard_srchAllowed || []);
                }
            }
        }
        if (regex.test(index.name) && index.name !== wildcard.name &&
            !(wildcard.name.charAt(0) === '*' && (index.name.charAt(0) === '_'))) {
            // check if wildcard has search default from any source
            if ((wildcard.srchDefault || wildcard.imported_srchDefault || wildcard.isDefPreview)) {
                // Adds wildcard name to search default list if not already included
                if (!index.wildcard_srchDefault || index.wildcard_srchDefault.indexOf(wildcard.name) < 0) {
                    index.wildcard_srchDefault = [wildcard.name].concat(index.wildcard_srchDefault || []);
                }
            // Remove wildcard from search default list if wildcard does not have search default
            } else if (index.wildcard_srchDefault && index.wildcard_srchDefault.indexOf(wildcard.name) > -1) {
                index.wildcard_srchDefault.splice(index.wildcard_srchDefault.indexOf(wildcard.name), 1);
            }
            // check if wildcard has search allowed from any source
            if (wildcard.srchAllowed || wildcard.imported_srchAllowed || wildcard.isIncPreview) {
                // Adds wildcard name to search allowed list if not already included
                if (!index.wildcard_srchAllowed || index.wildcard_srchAllowed.indexOf(wildcard.name) < 0) {
                    index.wildcard_srchAllowed = [wildcard.name].concat(index.wildcard_srchAllowed || []);
                }
            // Remove wildcard from search default list if wildcard does not have search allowed
            } else if (index.wildcard_srchAllowed && index.wildcard_srchAllowed.indexOf(wildcard.name) > -1) {
                index.wildcard_srchAllowed.splice(index.wildcard_srchAllowed.indexOf(wildcard.name), 1);
            }
            // Mark index as wildcard inherited so it shows up in inherited filter
            if (wildcard.imported_srchDefault || wildcard.imported_srchAllowed || wildcard.isDefPreview ||
                wildcard.isIncPreview) {
                if (!index.inherited_wildcards || index.inherited_wildcards.indexOf(wildcard.name) < 0) {
                    index.inherited_wildcards = [wildcard.name].concat(index.inherited_wildcards || []);
                }
            } else if (index.inherited_wildcards && index.inherited_wildcards.indexOf(wildcard.name) > -1) {
                index.inherited_wildcards.splice(index.inherited_wildcards.indexOf(wildcard.name), 1);
            }
            // Mark index as wildcard native so it shows up in native filter
            if (wildcard.srchDefault || wildcard.srchAllowed) {
                if (!index.native_wildcards || index.native_wildcards.indexOf(wildcard.name) < 0) {
                    index.native_wildcards = [wildcard.name].concat(index.native_wildcards || []);
                }
            } else if (index.native_wildcards && index.native_wildcards.indexOf(wildcard.name) > -1) {
                index.native_wildcards.splice(index.native_wildcards.indexOf(wildcard.name), 1);
            }
        }
        return index;
    });
    return changedWildcard;
}

export function getIndexPreview(importedInds, indexes, selection) {
    return indexes && indexes.map((ind) => {
        let item = { ...ind };
        item.isDefPreview = importedInds.def.has(item.name);
        item.isIncPreview = importedInds.inc.has(item.name);

        // uncheck the imported props on the index is a role has been uninherited.
        item.imported_srchAllowed = !item.isIncPreview ? false : item.imported_srchAllowed;
        item.imported_srchDefault = !item.isDefPreview ? false : item.imported_srchDefault;

        // Check covered wildcards
        if (item.isWildcard) {
            item = selectCoveredIndexes(item, indexes);
        }

        switch (selection) {
            case 'selected':
                item.filtered = item.srchAllowed || item.srchDefault || item.imported_srchAllowed ||
                    item.imported_srchDefault || !!item.isIncPreview || !!item.isDefPreview;
                break;
            case 'unselected':
                item.filtered = !(item.srchAllowed || item.srchDefault || item.imported_srchAllowed ||
                item.imported_srchDefault || !!item.isIncPreview || !!item.isDefPreview);
                break;
            case 'native':
                item.filtered = (item.srchDefault || item.srchAllowed);
                break;
            case 'inherited':
                item.filtered = item.imported_srchDefault || item.imported_srchAllowed
                    || !!item.isIncPreview || !!item.isDefPreview;
                break;
            default:
                item.filtered = item.filtered;
                break;
        }
        return item;
    });
}
/**
 * Function that returns capabilities with ui specific properties to be used under
 * Capabilities tab under add/edit roles dialog.
 * @param {[objects]} caps - Array of capabilities fetched from authorization/capabilities.
 * @param {object} currentRole - current role object being created/edited.
 * @returns {[objects]} - Array of capabilities
 */
export function getCapsWithSelection(caps, currentRole) {
    return caps && caps.map(cap => ({
        name: cap,
        filtered: true,
        source: getCapSource(cap, currentRole),
        selected: (currentRole && currentRole.content &&
            (currentRole.content.imported_capabilities.indexOf(cap) > -1 ||
            currentRole.content.capabilities.indexOf(cap) > -1)) || false,
        isPreview: false,
    }));
}
/**
 * Compares index name with regex to check if it contains an asterisk
 * @param {String} index - index name
 * @returns {Boolean}
 */
export function isWildcard(index) {
    return !!index && /[*]/.test(index);
}
/**
 * Sorts an array by key name using native Array sort()
 * @param {[Object]} arr - array of objects
 * @param {String} key - key present in each object to sort by
 * @returns {[{Object}]} - Sorted Array
 */
export function sortByKey(arr, key) {
    return arr && arr.length && arr.sort((a, b) => {
        if (a[key] < b[key]) {
            return -1;
        } else if (a[key] > b[key]) {
            return 1;
        }
        return 0;
    });
}

/**
 * Function that returns index with ui specific properties.
 * @param {object} index - incomplete index object
 * @param {[{objects}]} indxList - Array of indexes returned from search
 * @param {object} currentRole - current role object being created/edited.
 * @returns {objects} - built index state object
 */
function createIndexObject(index, idxList, currentRole) {
    let indexObj = {
        name: index.index,
        filtered: true,
        imported_srchDefault: !!(currentRole && currentRole.content
            && currentRole.content.imported_srchIndexesDefault.indexOf(index.index) > -1),
        imported_srchAllowed: !!(currentRole && currentRole.content
            && currentRole.content.imported_srchIndexesAllowed.indexOf(index.index) > -1),
        srchDefault: !!(currentRole &&
            currentRole.content && currentRole.content.srchIndexesDefault.indexOf(index.index) > -1),
        srchAllowed: !!(currentRole && currentRole.content &&
            ((currentRole.content.srchIndexesAllowed.indexOf(index.index) > -1) ||
            // The UI will normally forces a user to select srchIndexesAllowed (sIA) whenever
            // a user selects srchIndexesDefault (sID). However, a user can bypass the UI by
            // adding an index to sID via conf. The check below handles this scenario by checking
            // sID.
            (currentRole.content.srchIndexesDefault.indexOf(index.index) > -1))),
        isWildcard: !!index.isWildcard,
        wildcard_srchDefault: index.wildcard_srchDefault || [],
        wildcard_srchAllowed: index.wildcard_srchAllowed || [],
        inherited_wildcards: index.inherited_wildcards || [],
    };
    if (index.index === '*') {
        indexObj.label = _('All non-internal indexes');
    }
    if (index.index === '_*') {
        indexObj.label = _('All internal indexes');
    }
    // Select all indexes covered by wildcard
    if (index.isWildcard) {
        indexObj = selectCoveredIndexes(indexObj, idxList);
    }
    return indexObj;
}
/**
 * Function that returns indices with ui specific properties to be used under
 * Indexes tab under add/edit roles dialog.
 * @param {[{objects}]} indexes - Array of indexes returned from search
 * @param {object} currentRole - current role object being created/edited.
 * @returns {[objects]} - Array of index objs
 */
export function getSelectedIndexes(indexes, currentRole) {
    // Despite containing an asterisk, '*' & '_*' are not considered "wildcards"
    // b/c they are always there by default. This is how a user selects all internal
    // and all non-internal indexes in the roles modal.
    let idxList = indexes;
    let wildcardsList = [];
    if (currentRole && currentRole.content) {
        // Join all indexes in current role and dedup
        wildcardsList = union(
            currentRole.content.srchIndexesAllowed, currentRole.content.imported_srchIndexesAllowed,
            currentRole.content.srchIndexesDefault, currentRole.content.imported_srchIndexesDefault);

        // Reduce index list to only wildcards. Default wildcards "*" & "_*" do not count as wild cards.
        if (wildcardsList && wildcardsList.length) {
            wildcardsList = wildcardsList.reduce((wildcards, index) => {
                if (index !== '*' && index !== '_*' && isWildcard(index)) {
                    wildcards.push({ index, isWildcard: true });
                }
                return wildcards;
            }, []);
        }
    }

    // Wildcards need to be built first so covered indexes know their state.
    const defaultWildcards = [{ index: '*', isWildcard: true }, { index: '_*', isWildcard: true }].map(
        index => createIndexObject(index, idxList, currentRole));
    wildcardsList = wildcardsList.map(index => createIndexObject(index, idxList, currentRole));
    idxList = idxList.map(index => createIndexObject(index, idxList, currentRole));
    // Join all of the arrays (defaultWildcards, wildcardsList, Indexes). wildcardsList and indexes
    // are sorted seperately to ensure that the defaultWildcards alway appear first in the UI.
    return [...defaultWildcards, ...sortByKey([...wildcardsList, ...idxList], 'name')];
}
/**
 * Function that returns the title of the add/edit roles dialog.
 * @param {String} action - either 'new' or 'edit'
 * @returns {String/null} - returns string with accepted action string. null otherwise.
 */
export function getModalTitle(action) {
    switch (action) {
        case 'new':
            return _('New');
        case 'edit':
            return _('Edit');
        case 'clone':
            return _('Clone');
        default:
            return null;
    }
}
/**
 * Function that returns the label of the primary button on add/edit roles dialog.
 * @param {String} action - either 'new' or 'edit'
 * @param {Boolean} isWorking - Bool to indicate if the create/edit fetch call is in progress.
 * @returns {String}
 */
export function getButtonLabel(isWorking, action) {
    if (isWorking) {
        switch (action) {
            case 'new':
                return _('Creating...');
            default:
                return _('Saving...');
        }
    } else {
        switch (action) {
            case 'new':
                return _('Create');
            default:
                return _('Save');
        }
    }
}
/**
 * Function that returns the data object to POST to the create/edit roles endpoint.
 * @param {object} pData - Initial post data to work with.
 * @param resources - All the properties under the Resources tab in create/edit dialog.
 * @param roles - Selected roles under the Inheritance tab in create/edit dialog.
 * @param selectedCaps - selected capabilities under the Capabilities tab in create/edit dialog.
 * @param indexes - selected default and allowed indices under the Indexes tab in create/edit dialog.
 * @returns {object} - final post data.
 */
export function constructPostData(pData, { resources, roles, selectedCaps, indexes }) {
    const postData = pData;
    Object.keys(resources).forEach((key) => {
        postData[key] = resources[key];
    });
    const importedRoles = roles.filter(role => role.selected);
    const capabilities = selectedCaps.filter(cap => cap.selected && !cap.isPreview && cap.source !== 'inherited');
    const srchIndexesDefault = indexes.filter(index => index.srchDefault);
    const srchIndexesAllowed = indexes.filter(index => index.srchAllowed);
    postData.imported_roles = (importedRoles.length > 0) ? importedRoles.map(role => role.name) : '';
    postData.capabilities = (capabilities.length > 0) ? capabilities.map(cap => cap.name) : '';
    postData.srchIndexesDefault = (srchIndexesDefault.length > 0) ?
        srchIndexesDefault.map(ind => ind.name) : '';
    postData.srchIndexesAllowed = (srchIndexesAllowed.length > 0) ?
        srchIndexesAllowed.map(ind => ind.name) : '';

    const fshSearchCap = find(selectedCaps, cap => cap.name === 'fsh_search');
    if ((fshSearchCap && fshSearchCap.selected)
        || (pData.federatedProviders && resources.federatedProviders.length)) {
        /** with fsh_search capability, all changes related federated providers should be saved
         *  without fsh_search capability, federated providers changes should be saved.
         * Backend will report error to notify user
         */
        postData.federatedProviders = resources.federatedProviders.join(',');
    } else {
        delete postData.federatedProviders;
    }
    return postData;
}
/**
 * Function that returns one of ['none', 'all, 'some'] to represent toggleAll checkbox
 * @param {[objects]} data
 * @returns {String}
 */
export function rowRolesSelectionState(data) {
    if (data) {
        const selectedCount = data.reduce((count, { selected }) => (selected ? count + 1 : count), 0);
        if (selectedCount === 0) {
            return 'none';
        } else if (selectedCount === data.length) {
            return 'all';
        }
        return 'some';
    }
    return 'none';
}
/**
 * Construct the url to call the Delete role endpoint.
 * @param {String} title
 * @returns {String}
 */
export function getDeleteRoleUrl(title) {
    const data = { output_mode: 'json' };
    return createRESTURL(
        `${ROLES_COLLECTION_PATH}/${encodeURIComponent(title)}?${querystring.encode(data)}`);
}
/**
 * Construct the url to call the Capabilities endpoint.
 * @returns {String}
 */
export function getCapabilitiesUrl() {
    const data = { output_mode: 'json' };
    return createRESTURL(
        `${CAPABILITIES_COLLECTION_PATH}?${querystring.encode(data)}`);
}
/**
 * Construct the url to call the Roles endpoint.
 * @returns {String}
 */
export function getRolesUrl() {
    const data = { count: -1, output_mode: 'json' };
    return createRESTURL(
        `${ROLES_COLLECTION_PATH}?${querystring.encode(data)}`);
}
/**
 * Construct the url to call the Federated Providers endpoint.
 * @returns {String}
 */
export function getFederationsUrl() {
    const data = { count: 0, output_mode: 'json' };
    return createRESTURL(`${FEDERATIONS_COLLECTION_PATH}?${querystring.encode(data)}`);
}
/**
 * Function that toggles the row to selected/un-selected.
 * @param {[objects]} data
 * @param {String} name - name of the object to toggle selection
 * @param {string} type - name of the property in the object to toggle.
 * @returns {[objects]}
 */
export function toggleSelected(data, { name, type = null }) {
    const selected = find(data, { name });
    if (selected) {
        if (type) {
            /**
             * Indexes being marked as default should also be marked as selected.
             * Similarly, indexes unchecked as allowed should be unchecked as default."
             */
            if ((type === 'srchDefault' && !selected[type] && !selected.srchAllowed) ||
                (type === 'srchAllowed' && selected[type] && selected.srchDefault)) {
                selected.srchDefault = !selected.srchDefault;
                selected.srchAllowed = !selected.srchAllowed;
            } else {
                selected[type] = !selected[type];
            }
            /**
             * Wildcard indexes should update their covered indexes as well
             */
            if (selected.isWildcard) {
                selectCoveredIndexes(selected, data);
            }
        } else {
            selected.selected = !selected.selected;
        }
    }
    return data;
}
/**
 * Function to toggle all the rows in the table.
 * @param {[objects]} data
 * @returns {[objects]} array of object with the selected property toggled for all rows.
 */
export function toggleAll(data) {
    const state = rowRolesSelectionState(data);
    const selected = state !== 'all';
    const result = data.map(row => ({ ...row, selected }));
    return result;
}
/**
 * Function to filter data based on the name input.
 * @param {[objects]} data - Data structure storing roles, selectedCaps, or indexes
 * @param {String} stateVar - Name of the state variable that stores the data above
 * @param {String} name - Specifies what type of filtering should be done.
 * @param {String} value - Required to filter by name.
 * @returns {[objects]}
 */
export function filterData(data, stateVar, name, value = '') {
    return data && data.map((ind) => {
        const item = { ...ind };
        switch (name) {
            case 'selected':
                if (stateVar === 'roles') {
                    item.filtered = ind.selected;
                } else if (stateVar === 'selectedCaps') {
                    item.filtered = ind.isPreview || ind.selected;
                } else if (stateVar === 'indexes') {
                    item.filtered = ind.srchAllowed || ind.srchDefault || ind.imported_srchAllowed ||
                        ind.imported_srchDefault || !!ind.isIncPreview || !!ind.isDefPreview ||
                        !!(ind.wildcard_srchAllowed && (ind.wildcard_srchAllowed.length > 0)) ||
                        !!(ind.wildcard_srchDefault && (ind.wildcard_srchDefault.length > 0));
                }
                break;
            case 'unselected':
                if (stateVar === 'roles') {
                    item.filtered = !ind.selected;
                } else if (stateVar === 'selectedCaps') {
                    item.filtered = !ind.isPreview && !ind.selected;
                } else if (stateVar === 'indexes') {
                    item.filtered = !(ind.srchAllowed || ind.srchDefault || ind.imported_srchAllowed ||
                        ind.imported_srchDefault || !!ind.isIncPreview || !!ind.isDefPreview ||
                        (ind.wildcard_srchAllowed && (ind.wildcard_srchAllowed.length > 0)) ||
                        (ind.wildcard_srchDefault && (ind.wildcard_srchDefault.length > 0)));
                }
                break;
            case 'native':
                if (stateVar === 'selectedCaps') {
                    item.filtered = (ind.source === 'native' || ind.source === '') &&
                    !ind.isPreview && ind.selected;
                } else if (stateVar === 'indexes') {
                    item.filtered = (ind.srchDefault || ind.srchAllowed ||
                        !!(ind.native_wildcards && ind.native_wildcards.length > 0));
                }
                break;
            case 'inherited':
                if (stateVar === 'selectedCaps') {
                    item.filtered = ind.isPreview || ind.source === 'inherited';
                } else if (stateVar === 'indexes') {
                    item.filtered = ind.imported_srchDefault || ind.imported_srchAllowed ||
                        !!ind.isIncPreview || !!ind.isDefPreview ||
                        !!(ind.inherited_wildcards && ind.inherited_wildcards.length > 0);
                }
                break;
            case 'wildcards':
                item.filtered = !!ind.isWildcard;
                break;
            case 'name':
                item.filtered = (ind.name.indexOf(value) !== -1);
                break;
            default:
                item.filtered = true;
        }
        return item;
    });
}
/**
 * Formats state variable generatedSrchFilter that is used to display a preview
 * of the generated search filter in the restrictions tab.
 * @param {String} srchFilter
 * @param {String} concatOpt
 * @param {String} idxFieldSelected
 * @param {String} idxFieldValSelected
 * @returns {String}
 */
export function genSrchFilter(srchFilter, concatOpt, idxFieldSelected, idxFieldValSelected) {
    let srchFilterStr = '';
    // Only include concatOpt if the srchFilter is not empty
    if (srchFilter.trim() !== '') {
        srchFilterStr += ` ${concatOpt} `;
    }
    if (idxFieldSelected && idxFieldValSelected.length === 0) {
        srchFilterStr += `${idxFieldSelected}`;
    }
    if (idxFieldSelected && idxFieldValSelected.length > 0) {
        srchFilterStr += idxFieldValSelected.reduce((acc, val, i) => {
            let fieldValStr = acc;
            fieldValStr += `${idxFieldSelected}::${val}`;
            if (i === idxFieldValSelected.length - 1) {
                fieldValStr += ')';
            } else {
                fieldValStr += ' OR ';
            }
            return fieldValStr;
        }, '(');
    }
    return srchFilterStr;
}

/**
 * Formats the filter menu dropdown to show the active filter option selected
 * @param {String} menuSelected
 * @returns {String}
 */
export function getMenuLabel(menuSelected) {
    // Convert "uninherited" in the indexes tab to "native" to be consistent with the rest of the other tabs
    return `Showing ${menuSelected === 'uninherited' ? 'native' : menuSelected}`;
}

/**
 * Runs regex against srchFilter to check if it contains any instance of the '=' operator.
 * The regex only returns true if the '=' follows a word. Returns true if match, else false.
 * @param {String} srchFilter
 * @returns {Boolean}
 */
export function hasEquals(srchFilter) {
    return /(\w+)\s*(?:=)/.test(srchFilter);
}

/**
 * Runs regex against srchFilter to check if it contains the field selected followed by
 * either the '::' or '=' operators. Returns true if match, else false.
 * @param {String} fieldSelected
 * @param {String} srchFilter
 * @returns {Boolean}
 */
export function hasFieldCollision(fieldSelected, srchFilter) {
    if (fieldSelected && srchFilter) {
        const fieldRegex = new RegExp(sprintf('%(field)s\\s*(?:::|=)',
            // "*" is a special char in regex and is also a valid field char. To ensure the,
            // regex works properly, we must dynamically escape all instances of "*" in fieldSelected
            { field: fieldSelected.replace(/[*]/g, '\\$&') }));
        return fieldRegex.test(srchFilter);
    }
    return false;
}

/**
 * Ref callback handler to scroll to DOM node
 * @param {Object} React ref
 */
export function scrollToRef(ref) {
    if (ref && ref.scrollIntoView) {
        ref.scrollIntoView(false);
    }
}

/**
* Validates whether or not index name is valid. Indexes must begin with a letter or number,
* can only include alphanumeric chars, _, or -, and must be all lower case. We also include the char "*"
* b/c this function is used in wildcard name validation.
 * @param {String} name - index name
 */
export function isValidIdxName(name) {
    return /(^[a-z0-9*_]+)([a-z0-9*_-]*)$/.test(name);
}

/**
 * Returns tooltip for index list to explain why checkboxes are disabled.
 * @param {Object} row
 * @param {String} selectionType
 * @returns {String}
 */
export function getIndexTooltip(row, selectionType) {
    let tooltip = '';
    if (row[`imported_${selectionType}`]) {
        tooltip = _('This index is inherited');
    } else if (row[`wildcard_${selectionType}`] &&
        row[`wildcard_${selectionType}`].length > 0) {
        tooltip = _(sprintf('This index is matched by the selected wildcard(s): %(list)s%(count)s',
            {
                list: row[`wildcard_${selectionType}`].slice(0, 3).join(', '),
                count: row[`wildcard_${selectionType}`].slice(3).length
                    ? sprintf('...(%s)', row[`wildcard_${selectionType}`].slice(3).length)
                    : '',
            }));
    }
    return tooltip;
}
