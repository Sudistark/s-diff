/**
    Polyfill for $.extend.
    @param {Object} orig - object which needs to be extended
    @param {params} args - objects which need to be merged into orig
*/
export function extend(orig, ...args) {
    const out = orig || {};

    args.forEach((arg) => {
        if (arg) {
            Object.keys(arg).forEach((key) => {
                out[key] = arg[key];
            });
        }
    });

    return out;
}

export function deepExtend(orig, ...args) {
    const out = orig || {};

    args.forEach((arg) => {
        const obj = arg;

        if (obj) {
            Object.keys(obj).forEach((key) => {
                if (typeof obj[key] === 'object') {
                    if (obj[key] instanceof Array) {
                        out[key] = obj[key].slice(0);
                    } else {
                        out[key] = deepExtend(out[key], obj[key]);
                    }
                } else {
                    out[key] = obj[key];
                }
            });
        }
    });

    return out;
}
