export class RolesNode {
    constructor(role, parent, idxSettings) {
        this.children = [];
        this.data = Object.assign({}, role.content, { name: role.name, idxSettings, parent });
    }
    addChild = (rolesNode) => { this.children.push(rolesNode); };
    setIdxSettings = (idxSettings) => {
        Object.assign(this.data, { idxSettings });
    }
}

export class RolesTree {
    constructor(role, rolesCollection, index) {
        const idxSettings = {
            srchAllow: role.content.srchIndexesAllowed.indexOf(index) !== -1,
            impSrchAllow: role.content.imported_srchIndexesAllowed.indexOf(index) !== -1,
            srchDef: role.content.srchIndexesDefault.indexOf(index) !== -1,
            impSrchDef: role.content.imported_srchIndexesDefault.indexOf(index) !== -1,
        };
        this.index = index;
        this.root = new RolesNode(role, null, idxSettings);
        /** Unordered array of all nodes in the tree */
        this.rolesArr = [];
        this.rolesMap = this.genRolesMap(rolesCollection);
        this.genRolesTree(this.root);
    }
    /**
     * Iterates though roles collection and generates a map with the role name as the key
     * and the REST data as the value
     * @param rolesCollection - REST response of /authorization/roles
     * @returns {Object}
     */
    genRolesMap = (rolesCollection) => {
        const rolesMap = {};
        for (let i = 0; i < rolesCollection.length; i += 1) {
            rolesMap[rolesCollection[i].name] = rolesCollection[i];
        }
        return rolesMap;
    }
    /**
     * Recursive method to generate a general tree to represent the inheritance structure of a role
     * @param {Object} current - Instance of RolesNode class
     * @returns {Object} - General Tree (Tree with any number of child nodes)
     */
    genRolesTree = (current) => {
        // Check each index setting (srchIndexesAllowed, imported_srchIndexesAllowed, srchIndexesDefault,
        // imported_srchIndexesDefault) to see if it includes the given index.
        const srchAllow = current.data.srchIndexesAllowed.indexOf(this.index) !== -1;
        const impSrchAllow = current.data.imported_srchIndexesAllowed.indexOf(this.index) !== -1;
        const srchDef = current.data.srchIndexesDefault.indexOf(this.index) !== -1;
        const impSrchDef = current.data.imported_srchIndexesDefault.indexOf(this.index) !== -1;

        // Base case 1: If the node does not contain the index at all, return null so that the the node will not
        // be a part of the tree.
        if (!srchAllow && !impSrchAllow && !srchDef && !impSrchDef) {
            return null;
        }

        // Add the idxSettings to the node's data object
        current.setIdxSettings({ srchAllow, impSrchAllow, srchDef, impSrchDef });
        // Base case 2: If the node has the index setting natively, return the node to end tree traversal.
        // The checks for (!impSrchAllow && srchDef) and (srchAllow && srchDef) are to handle previous versions
        // of splunk <7.3.0 where it was possible to have an index be default, but not included.
        if (current.data.imported_roles.length === 0 || (srchAllow && !impSrchDef) ||
            (!impSrchAllow && srchDef) || (srchAllow && srchDef)) {
            // As we're traversing the tree, add node to attr rolesArr.
            this.rolesArr.push(current);
            return current;
        }

        current.data.imported_roles.forEach((roleName) => {
            const child = this.genRolesTree(new RolesNode(this.rolesMap[roleName], current));
            if (child) {
                // Only append a child if the value returned is not null. See base case 1 above.
                current.addChild(child);
                // As we're traversing the tree, add node to attr rolesArr.
                this.rolesArr.push(current);
            }
        });
        return current;
    }
 }
