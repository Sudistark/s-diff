/* eslint-disable no-bitwise */
const hashString = (str) => {
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

export default hashString;
