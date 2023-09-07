/* eslint-disable no-bitwise */
import { sha256 } from 'js-sha256';

export const getDefaultSalt = () => (
    window.btoa(encodeURIComponent(window.$C.USERNAME)) + window.$C.BUILD_NUMBER
);

export const hashString = (str) => {
    if (!str) {
        return null;
    }
    let hash = 0;
    for (let i = 0; i < str.length; i += 1) {
        const chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0;
    }
    return hash;
};

export const hashSha256 = (str) => {
    if (!str) {
        return null;
    }
    return sha256(str + getDefaultSalt());
};
