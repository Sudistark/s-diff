define(['util/moment', 'underscore'], function(moment, _) {

    var UNITS = {
        second: 's,sec,secs,second,seconds',
        minute: 'm,min,minute,minutes',
        hour: 'h,hr,hrs,hour,hours',
        day: 'd,day,days',
        week: 'w,week,weeks',
        month: 'mon,month,months',
        quarter: 'q,qtr,qtrs,quarter,quarters',
        year: 'y,yr,yrs,year,years'
    };

    var unitMap = _.once(function() {
        var result = {};
        _(UNITS).each(function(aliases, unit) {
            _(aliases.split(',')).each(function(alias) {
                result[alias] = unit;
            });
        });
        return result;
    });

    function parseRemainder(result, remainder) {
        while (remainder.length) {
            var match = remainder.match(/([+-]?\d+)([a-z]\w*)/);
            result.push(parseRelativeTimeExpressionPart(remainder));
            remainder = remainder.substring(match[0].length);
        }
    }

    function parseRelativeTimeExpressionPart(part) {
        if (part == 'now') {
            return {now: true};
        } else {
            var match = part.match(/([+-]?\d*)([a-z]\w*)/);
            if (match) {
                var amount = parseInt(match[1], 10);                
                var unit = match[2];
                var momentUnit = unitMap()[unit];
                if (!momentUnit) {
                    throw new Error('Invalid unit ' + JSON.stringify(unit) + ' in relative time expression');
                }
          
                return {
                    amount: parseInt(amount, 10),
                    unit: momentUnit
                };
            } else {
                throw new Error('Invalid relative time expression: ' + JSON.stringify(part));
            }
        }
    }

    function parseRelativeTimeExpression(expr, options) {
        var arr = [];
        options || (options = {});
        if (expr == null) {
            return;
        }
        expr = String(expr).trim();

        if (/^-?\d+$/.test(expr)) {
            var plainNumber = parseInt(expr, 10);
            if (options.treatPlainNumberAs) {
                arr.push({
                    amount: plainNumber,
                    unit: unitMap()[options.treatPlainNumberAs]
                });

                if (!(typeof options.snapAhead === 'undefined' || typeof arr[0] === 'undefined')) {
                    arr[0].snapAhead = options.snapAhead;
                }
                return arr;
            } else if (options.allowAbsoluteValue !== false) {
                // Absolute/epoch time expression
                arr.push({
                    absolute: parseInt(expr, 10)
                });

                if (!(typeof options.snapAhead === 'undefined' || typeof arr[0] === 'undefined')) {
                    arr[0].snapAhead = options.snapAhead;
                }
                return arr;
            } else {
                throw new Error('Absolute time value ' + JSON.stringify(expr) + 'is not allowed in relative time expression');
            }
        }

        var result = [];
        var parts = expr.split('@', 2);

        if (parts[0] !== '') {
            result.push(parseRelativeTimeExpressionPart(parts[0]));
        }

        if (!(typeof options.snapAhead === 'undefined' || typeof result[0] === 'undefined')) {
            result[0].snapAhead = options.snapAhead;
        }

        if (parts.length > 1) {
            var snap = parts[1].match(/^[a-z]\w*/);
            if (snap) {
                snap = snap[0];
                var remainder = parts[1].substring(snap.length);
                var weekday = snap.match(/w([0-7])/);
                if (weekday) {
                    result.push({snapTo: 'week'}, {amount: parseInt(weekday[1], 10), unit: 'day', isWeekDaySnap: true});
                } else {
                    var snapUnit = unitMap()[snap];
                    if (!snapUnit) {
                        throw new Error('Invalid snap-to unit ' + JSON.stringify(snapUnit) + ' in relative time expression');
                    }
                    result.push({snapTo: snapUnit});
                }
                if (remainder.length) {
                    parseRemainder(result, remainder);
                }
            } else {
                throw new Error('Invalid snap-to expression: ' + JSON.stringify(parts[1]));
            }
        }

        return result;
    }

    function applyRelativeTimeExpressionPart(m, expr, baseBeforeWeekdaySnap) {
        if (expr.absolute != null) {
            return moment.unix(expr.absolute);
        }

        if (expr.now === true) {
            return moment();
        }

        if (expr.amount != null) {
            if (expr.snapAhead) {
                return moment(m).add(expr.amount, expr.unit);
            }

            var updatedRelativeDateTime = moment(m).add(expr.amount, expr.unit);

            if (expr.isWeekDaySnap && baseBeforeWeekdaySnap) {
                // after snap week operation and baseDateTimeBeforeSnap is before or same as the updatedRelativeDateTime, then it needs to shift back a week
                if (moment(baseBeforeWeekdaySnap).isSameOrBefore(updatedRelativeDateTime)){
                    updatedRelativeDateTime = updatedRelativeDateTime.add(-1, 'w');
                }
            }
            return updatedRelativeDateTime;
        }

        if (expr.snapTo) {
            return moment(m).startOf(expr.snapTo);
        }

        throw new Error('Invalid parsed time expression part: ' + JSON.stringify(expr));
    }

    function applyRelativeTimeExpression(m, parsed) {
        var baseBeforeWeekdaySnap = null;

        return _.inject(parsed, function(m, expr) {
            if (expr.snapTo === 'week') {
                baseBeforeWeekdaySnap = m;
            }
            return applyRelativeTimeExpressionPart(m, expr, baseBeforeWeekdaySnap);
        }, m);
    }

    moment.fn.applyRelative = function(expr, options) {
        return applyRelativeTimeExpression(this, parseRelativeTimeExpression(expr, options));
    };

    function isRelativeTimeExpression(val, options) {
        try {
            var parsed = parseRelativeTimeExpression(val, options);
            return parsed.length > 0;
        } catch(e) {
            return false;
        }
    }

    return {
        parseRelativeTimeExpression: parseRelativeTimeExpression,
        applyRelativeTimeExpression: applyRelativeTimeExpression,
        applyRelativeTimeExpressionPart: applyRelativeTimeExpressionPart,
        isRelativeTimeExpression: isRelativeTimeExpression
    };
});
