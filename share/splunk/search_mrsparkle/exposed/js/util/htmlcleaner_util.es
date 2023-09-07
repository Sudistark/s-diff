/**
 * These are private functions for htmlcleaner.js
 * You should probably not be using these functions
 */
import { Address6 } from 'ip-address';
import { parse as parseURL } from 'url';

const console = require('./console');

const IS_IP_ADDR = new RegExp([
    '^(\\d{1,3}|\\*|\\d{1,3}-\\d{1,3})\\.',
    '(\\d{1,3}|\\*|\\d{1,3}-\\d{1,3})\\.',
    '(\\d{1,3}|\\*|\\d{1,3}-\\d{1,3})\\.',
    '(\\d{1,3}|\\*|\\d{1,3}-\\d{1,3})',
    '(:\\d{1,5})?$'].join(''));
const IS_DOMAIN = /([A-Za-z0-9:*-]+\.?)+/;

export const isIpv6Addr = (domain) => {
    // This regex strips out square brackets if the port number was specified
    //    via the web.conf
    const result = /^\[([0-9a-fA-F:/]*)\]/.exec(domain);
    return result && result[1] ?
        (new Address6(result[1])).isValid() :
        (new Address6(domain)).isValid();
};

/*
* Creates a valid IPV6 object. Uses http://ip-address.js.org/
*/
export const createIp6AddrObj = (ip) => {
    let addr;
    // captures IP addr in first capture group and port number in second group
    const result = /^\[([0-9a-fA-F:/]*)\]:(\d{1,5})/.exec(ip);
    if (result && result[1]) {
        addr = new Address6(result[1]);
        addr.port = parseInt(result[2], 10);
        return addr;
    }
    addr = new Address6(ip);
    addr.port = null;
    return addr;
};

export const isIpv4Addr = (domain) => {
    const ip = IS_IP_ADDR.exec(domain);
    // Should be a full match
    if (!ip || ip[0] !== domain) {
        return false;
    }
    return true;
};

/**
* @param {String} ip
* The IP string input syntax is defined by the web.conf flag dashboard_html_allowed_domains
* Returns an ip object that represents an ipv4 address
* ip[0],ip[1],ip[2],ip[3] represents the bytes of an ip address
* ip[x].low,ip[x].high represents the range of allowed address for byte x
* ip[4] represents the port number, defaults to undefined if port is not set
*/
export const createIpAddrObj = (ip) => {
    const ipAddrObj = [];
    const parsedIp = IS_IP_ADDR.exec(ip);
    parsedIp.shift();

    for (let k = 0; k < 4; k += 1) {
        const ipObj = {};
        if (parsedIp[k].match(/^\*$/)) {
            ipObj.low = 0;
            ipObj.high = 255;
        } else if (parsedIp[k].match(/-/)) {
            ipObj.low = parseInt(parsedIp[k].split('-')[0], 10);
            ipObj.high = parseInt(parsedIp[k].split('-')[1], 10);
        } else {
            ipObj.low = parseInt(parsedIp[k], 10);
            ipObj.high = parseInt(parsedIp[k], 10);
        }
        ipAddrObj.push(ipObj);
    }
    if (parsedIp[4]) {
        // the capture groups include the colon, slice it out here
        ipAddrObj.push(parsedIp[4].slice(1));
    } else {
        ipAddrObj.push(undefined);
    }
    return ipAddrObj;
};

export const isDomain = (domain) => {
    const dom = IS_DOMAIN.exec(domain);
    const CHECK_ILLEGAL_SYMBOL = /[^A-Za-z0-9-:.*]/g;
    const CHECK_ILLEGAL_DOT = /\.{2,}/g;
    const CHECK_ILLEGAL_ASTERISK = /.\*|\*(?!\.)/g;
    const CHECK_ILLEGAL_COLON = /.*:.+:.*/g;
    if (CHECK_ILLEGAL_SYMBOL.test(domain) ||
        CHECK_ILLEGAL_DOT.test(domain) ||
        CHECK_ILLEGAL_ASTERISK.test(domain) ||
        CHECK_ILLEGAL_COLON.test(domain)) {
        return false;
    }
    if (dom && dom[0] === domain) {
        return true;
    }
    return false;
};

export const createDomainRegex = (domain) => {
    let domainRegex;
    if (!/\*/.test(domain)) {
        domainRegex = `^${domain}$`;
    }
    const wildcardDomain = domain.match(/^\*\.(.+)/);
    if (wildcardDomain) {
        domainRegex = `^([a-zA-Z0-9-]+.)+${wildcardDomain[1]}$|^${wildcardDomain[1]}$`;
    }
    domainRegex = domainRegex.replace(/\./g, '\\.');
    return new RegExp(domainRegex, 'i');
};

// valid domains can either be dns names (human readable) or ip addresses
// Look at "dashbaord_html_allowed_domains" in web.conf
export const bucketDomainsByType = (domainArray) => {
    const domainResult = { dnsName: [], ip4Address: [], ip6Address: [] };
    for (let i = 0; i < domainArray.length; i += 1) {
        const domain = domainArray[i];
        // it is important to test for an ipv4 address first because
        // the syntax rules for an ipv4 address matches the rules for a
        // domain name. ie 127.0.0.1 is technically a valid domain
        if (isIpv4Addr(domain)) {
            domainResult.ip4Address.push(createIpAddrObj(domain));
        } else if (isDomain(domain)) {
            domainResult.dnsName.push(createDomainRegex(domain));
        } else if (isIpv6Addr(domain)) {
            domainResult.ip6Address.push(createIp6AddrObj(domain));
        } else {
            console.warn('Could not parse ', domain, '. Check the web.conf.spec for proper domain schemes');
        }
    }
    return domainResult;
};

/*
* Accepts a string URL
* Returns either an IPV6 object or just the hostname
* Uses Node JS (8.x) URL library (https://nodejs.org/docs/latest-v8.x/api/url.html)
* Uses the npm package ip-address (http://ip-address.js.org/)
*/
export const getDomainFromUrl = (url) => {
    let domain;
    // Technically the url path is case sensitive
    // However, this function only cares about the domain
    //  and the domain is case insensitive
    const lcUrl = url.toLowerCase();
    domain = Address6.fromURL(lcUrl);

    if (domain.address && domain.address.isValid()) {
        return domain;
    }
    // default to URL parsing
    domain = parseURL(lcUrl);
    return domain.host || lcUrl;
};

export const isValidIpv4Addr = (validIpAddr, testIp) => {
    const ipAddrSegments = IS_IP_ADDR.exec(testIp);
    // capture group includes the colon if there was a port number with the ip address
    // need to slice it off here
    // different array lengths here because ipAddrSegments[0] contains the full match
    ipAddrSegments[5] = ipAddrSegments[5] ? ipAddrSegments[5].slice(1) : undefined;
    for (let k = 0; k < 4; k += 1) {
        if (parseInt(ipAddrSegments[k + 1], 10) < validIpAddr[k].low ||
            parseInt(ipAddrSegments[k + 1], 10) > validIpAddr[k].high) {
            return false;
        }
    }
    if (ipAddrSegments[5] === validIpAddr[4]) {
        return true;
    }
    return false;
};

export const isValidIpv6Addr = (validIpAddr, testIp) => {
    if (validIpAddr.decimal() === testIp.address.decimal() ||
        testIp.address.isInSubnet(validIpAddr)) {
        // if the ports are the same or they are both undefined
        if (validIpAddr.port === testIp.port ||
            (!validIpAddr.port && !testIp.port)
        ) {
            return true;
        }
    }
    return false;
};

/**
 * Utilized to check if an <iframe> has a valid src attribute
 * @param {String} url
 * @returns {Boolean}
 */
export const isAllowedDomain = (ALLOWED_DOMAINS, url) => {
    const domain = getDomainFromUrl(url);
    let returnValue = false;
    if (location.hostname && location.hostname === domain) {
        return true;
    }

    if (isIpv4Addr(domain)) {
        returnValue = ALLOWED_DOMAINS.ip4Address.some(allowedIp => isValidIpv4Addr(allowedIp, domain));
    } else if (isDomain(domain)) {
        returnValue = ALLOWED_DOMAINS.dnsName.some(allowedDomain => allowedDomain && allowedDomain.test(domain));
    } else if (domain.address.isValid()) {
        returnValue = ALLOWED_DOMAINS.ip6Address.some(allowedIp => isValidIpv6Addr(allowedIp, domain));
    }

    if (!returnValue) {
        console.warn(`${domain} is not an allowed domain as specified by web.conf`);
    }
    return returnValue;
};
