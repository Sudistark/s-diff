var jsdom = require('./highcharts-jsdom'),
    i18n = require('./i18n'),
    __script_basepath = "file:///" + __dirname + "/httpdocs/static/js/",
    __font_basepath = "file:///" + __dirname + "/";

var fs = require('fs');

function createChartingWindow(locale, scriptBasepath, callback) {

    if (!i18n.isValidLocaleFormat(locale)) {
        // Make sure locale is valid to prevent malicious code execution https://jira.splunk.com/browse/SPL-206378
        callback(new Error(`SVG cannot be rendered due to invalid locale: ${locale}`), null);
        return;
    }

    jsdom.env({
        html: "<html><head></head><body><div id='container'></div></body></html>",
        src: [
            fs.readFileSync(scriptBasepath + "i18n.js").toString(),

            // Prepare i18n since we didn't load it from splunk web
            'window._i18n_locale=' + JSON.stringify(i18n.getLocaleData(locale)) + ';',
            'window.locale_name = function() { return "' + locale + '"; };',
            'window.locale_uses_day_before_month = function() { return false; };',

            // NOTE: if there is any error when loading/executing jscharting library, jsdom
            // willl NOT report the detailed error message. Developer needs to manually create an
            // HTML file that includes jscharting, to test out what the error message is.
            // One example is SPL-143344.
            fs.readFileSync(scriptBasepath + "../build/jscharting/index.js").toString()

        ],
        done: function (err, window) {
            if (err) {
                callback(err, null);
                return;
            }

            // Set up mock console logging
            var mockConsole = {
                log: function () {
                    mockConsole.addMessage.apply(mockConsole, arguments);
                },
                warn: function () {
                    mockConsole.addMessage.apply(mockConsole, arguments);
                },
                debug: function () {
                    mockConsole.addMessage.apply(mockConsole, arguments);
                },
                error: function () {
                    mockConsole.addMessage.apply(mockConsole, arguments);
                },

                messages: [],
                addMessage: function (args) {
                    var i, strSegments = [];
                    for (i = 0; i < arguments.length; i++) {
                        strSegments.push(arguments[i]);
                    }
                    mockConsole.messages.push('JSDOM CONSOLE: ' + strSegments.join(' '));
                }
            };
            window.console = mockConsole;

            callback(null, window);
        }
    });
}

function getSVG(data, scriptBasepath, callback) {
    if (scriptBasepath === null || scriptBasepath === undefined) {
        scriptBasepath = __script_basepath;
    }

    createChartingWindow(data.locale, scriptBasepath, function (err, window) {
        if (err) {
            callback(err, null);
        }
        else {
            var $ = window.$;
            var Splunk = window.Splunk;
            var $container = $('#container');

            var getConsoleMessages = function () {
                if (window.console.messages && window.console.messages.length > 0) {
                    return window.console.messages;
                }
                return null;
            };

            Splunk.jschartingUtils.prepareChartingLibrary(Splunk.JSCharting, {
                'SERVER_ZONEINFO': data['SERVER_ZONEINFO']
            });
            var chartData = Splunk.JSCharting.extractChartReadyData(data.series);
            // Unfortunately, a little bit of duplication of what happens in util/jscharting_utils.
            // If the data contains '_tc' - and indication of the 'top' or 'rare' commands - suppress the 'percent' field
            // (SPL-79265)
            if (chartData.hasField('_tc')) {
                data.props.fieldHideList = ['percent'];
            }
            $container.width(parseInt(data.width, 10)).height(parseInt(data.height, 10));
            try {
                var chart = Splunk.JSCharting.createChart($container[0], data.props);

                chart.prepareAndDraw(chartData, data.props, function () {
                    var svg = chart.getSVG();
                    // un-comment this next line to pretty-print the SVG to python.log
                    //throw new Error(svg.replace(/>/g, ">\n"));

                    callback({consoleMessages: getConsoleMessages()}, svg);
                });
            }
            catch (err) {
                var fullError = {
                    consoleMessages: getConsoleMessages(),
                    message: err
                };
                callback(fullError, null);
            }
        }
    });
}

exports.getSVG = getSVG;
