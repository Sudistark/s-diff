import querystring from 'querystring';
import { isEmpty } from 'lodash';
import { normalizeBoolean } from 'splunk.util';

export const getQueryParams = (url) => {
    if (!url || url.indexOf('?') < 0) {
        return {};
    }
    const search = `?${url.split('?')[1]}`;
    return querystring.parse(search.replace(/^\?/, ''));
};

export const getFlagFromURL = (url, flag) => {
    if (!url || !flag) {
        return null;
    }
    const queryParams = getQueryParams(url);
    const flags = queryParams[flag];
    if (typeof flags === 'string' || flags instanceof String) {
        return flags;
    }
    return isEmpty(flags) ? null : flags[0];
};

export const getURLWithoutFlag = (url, flag) => {
    if (!url || !flag) {
        return url;
    }
    const queryParams = getQueryParams(url);
    delete queryParams[flag];
    const urlWithoutQueryString = url.split('?')[0];
    const queryString = Object.keys(queryParams).map(key => `${key}=${queryParams[key]}`).join('&');
    return isEmpty(queryParams) ? urlWithoutQueryString : `${urlWithoutQueryString}?${queryString}`;
};

export const goToURL = (url) => {
    history.replaceState(
        {},
        '',
        url,
    );
};

export const setURLFlag = (url, flag, value, shouldGoToURL = true) => {
    let newURL = getURLWithoutFlag(url, flag);
    if (newURL && flag) {
        const prefixChar = newURL.includes('?') ? '&' : '?';
        newURL = `${newURL}${prefixChar}${flag}=${value}`;
        if (shouldGoToURL) {
            goToURL(newURL);
        }
        return newURL;
    }
    return null;
};

export const removeURLFlag = (url, flag) => {
    const newURL = getURLWithoutFlag(url, flag);
    if (newURL) {
        goToURL(newURL);
    }
};

export const getHasChangesFlag = (url) => {
    const rawValue = getFlagFromURL(url, 'has_changes');
    return rawValue && normalizeBoolean(rawValue) ? Boolean(rawValue) : false;
};
