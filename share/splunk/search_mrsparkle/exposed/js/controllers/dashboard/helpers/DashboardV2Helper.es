import splunkUtils from 'splunk.util';

export const DASHBOARD_VIEW_AVAILABLE_VERSION = 0.8;

let appName = null;
let dashboardAppFeatureEnabled = false;
let isDashboardAppInstalled = false;
let dashboardViewAvailable = false;
let appVersion = null;

/**
 * Returns true if version1 is greater than or equal to version2
 *
 * @param {String or Number} version1
 * @param {String or Number} version2
 *
 * @return {Boolean}
 */
export const compareVersions = (version1, version2) => {
    const version1Splits = version1.toString().split('.', 2).map(num => parseInt(num, 10));
    const version2Splits = version2.toString().split('.', 2).map(num => parseInt(num, 10));
    return version1Splits[0] > version2Splits[0] ||
        (version1Splits[0] === version2Splits[0] && version1Splits[1] >= version2Splits[1]);
};

export const initialize = ({ model, collection }) => {
    appName = model.web.entry.content.get('splunk_dashboard_app_name');
    dashboardAppFeatureEnabled = splunkUtils.normalizeBoolean(
        model.web.entry.content.get('enable_splunk_dashboard_app_feature'));
    const dashboardApp = collection.appLocals.findByEntryName(appName);
    isDashboardAppInstalled = !!dashboardApp;
    appVersion = dashboardApp && dashboardApp.getVersion();
    dashboardViewAvailable = isDashboardAppInstalled && dashboardAppFeatureEnabled &&
        compareVersions(appVersion, DASHBOARD_VIEW_AVAILABLE_VERSION);
};

export const getDashboardV2AppName = () => appName;
export const setDashboardV2AppName = (name) => { appName = name; };
export const getDashboardV2AppVersion = () => appVersion;
export const setDashboardV2AppVersion = (version) => { appVersion = version; };

/**
 * Returns true if enable_splunk_dashboard_app_feature preference is set as true in web.conf
 *
 * @return {Boolean}
 */
export const isDashboardAppFeatureEnabled = () => dashboardAppFeatureEnabled;

/**
 * Returns true if splunk-dashboard-app is installed
 *
 * @return {Boolean}
 */
export const isV2Supported = () => isDashboardAppInstalled;

/**
 * Returns true if dashboard view from splunk-dashboard-app is available globally for all apps.
 *
 * @return {Boolean}
 */
export const isDashboardViewAvailable = () => dashboardViewAvailable;
