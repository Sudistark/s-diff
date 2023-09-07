import { createRESTURL } from '@splunk/splunk-utils/url';
import { defaultFetchInit, handleResponse, handleError } from '@splunk/splunk-utils/fetch';
import { _ } from '@splunk/ui-utils/i18n';

export const PACKAGES_COLLECTION_PATH = createRESTURL('dmc/packages');
export const DMC_AGENT_CONFIG_PATH = createRESTURL('properties/dmc_agent/dmc/private_app_vetting_global');

export const APP_VETTING_IN_PROGRESS_MSG = _('%s was uploaded successfully! We are now ' +
    'checking your app for issues. This will take a few minutes. Do not navigate away from ' +
    'this page.');
export const APP_INSTALLATION_IN_PROGRESS_MSG = _('Splunk cloud is installing %s.');
export const SPLUNK_DEV_DOCS_URL = 'https://dev.splunk.com/enterprise/docs/developapps/testvalidate/' +
    'appinspect/appinspectreferencetopics/splunkappinspectcheck/';


export function callAcknowledgeRisk(packageId, accept) {
    const data = { accept };
    const fetchInit = {
        ...defaultFetchInit,
        method: 'POST',
        contentType: 'application/json',
        body: JSON.stringify(data),
    };
    fetchInit.headers['Content-Type'] = 'application/json';
    const url = createRESTURL(
        `${PACKAGES_COLLECTION_PATH}/${encodeURIComponent(packageId)}/ack`);
    return fetch(url, fetchInit)
    .then(handleResponse(200));
}

export function callGetPrivateAppGloablFlag() {
    return fetch(createRESTURL(`${DMC_AGENT_CONFIG_PATH}`), {
        ...defaultFetchInit,
    })
    .then(handleResponse(200))
    .catch(handleError(_('Couldn\'t get private app global flag')));
}

export function callGetPackages() {
    return fetch(createRESTURL(`${PACKAGES_COLLECTION_PATH}`), {
        ...defaultFetchInit,
    })
    .then(handleResponse(200))
    .catch(handleError(_('Couldn\'t get package information')));
}
