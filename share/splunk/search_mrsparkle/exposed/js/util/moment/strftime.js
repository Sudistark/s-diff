define(['util/moment'], function(moment) {

    var STRFTIME_FMT_TRANSLATIONS = {
        // years
        y: 'YY',
        Y: 'YYYY',
        //months
        m: 'MM',
        b: 'MMM',
        B: 'MMMM',
        // days
        a: 'ddd',
        A: 'dddd',
        d: 'DD',
        e: 'D',
        j: 'DDDD',
        w: 'd',
        // time
        H: 'HH',
        k: 'H',
        M: 'mm',
        S: 'ss',
        I: 'hh',
        p: 'A',
        // subsecond
        Q: 'SSS',
        '3N': 'SSS',
        '6N': 'SSS000',
        '9N': 'SSS000000',
        // unix time
        s: 'X',
        // timezone
        z: 'ZZ',
        Z: 'zz',
        // composite formats
        T: 'HH:mm:ss',
        F: 'YYYY-MM-DD',
        c: 'LLL',
        // misc
        U: 'ww',
        W: 'ww',
        // escape chars
        '%': '[%]',
        n: '[\n]',
        t: '[\t]'
    };

    var STRPTIME_FMT_TRANSLATIONS = Object.assign({}, STRFTIME_FMT_TRANSLATIONS, {
        // subsecond
        // Using 4 subsecond tokens allows any number of subsecond digits to be 
        // parsed, which is consistent with the behavior of strptime in search
        Q: 'SSSS',
        '3N': 'SSSS',
        '6N': 'SSSS',
        '9N': 'SSSS',
    });

    /**
     * Translates the given strftime format string into a moment.js format string by mapping the percent-sign prefixed
     * placeholders to equivalent moment.js tokens and escaping the remaining content of the format string.
     * 
     * @param {String} fmt strftime format
     * @param {Object} fmtTranslations map of strftime format specifiers to moment format specifiers
     * @returns {String} moment.js format string
     */
    function translateStrftimeSpecifiers(fmt, fmtTranslations) {
        var translations = fmtTranslations || STRFTIME_FMT_TRANSLATIONS;
        var result = fmt.replace(/%([369]N|.)/g, function(match) {
            var spec = match.substring(1);
            var res = translations[spec];
            if (res == null) {
                throw new Error('Invalid/unsupported strftime specifier' + JSON.stringify(match));
            }
            return ']' + res + '[';
        });
        result = result[0] === ']' ? result.substring(1) : '[' + result;
        result = result.charAt(result.length - 1) === '[' ? result.substring(0, result.length - 1) : result + ']';
        return result.replace(/\[\]/g, '');
    }

    moment.translateStrftimeSpecifiers = translateStrftimeSpecifiers;

    moment.isValidStrftimeSpecifier = function isValidStrftimeSpecifier(fmt) {
        try {
            translateStrftimeSpecifiers(fmt);
        } catch (e) {
            return false;
        }
        return true;
    };

    moment.fn.strftime = function(fmt) {
        return fmt === '' ? '' : this.format(translateStrftimeSpecifiers(fmt));
    };

    moment.strptime = function(dateStr, fmt) {
        return moment(dateStr, translateStrftimeSpecifiers(fmt, STRPTIME_FMT_TRANSLATIONS), true);
    };

    return moment;
});
