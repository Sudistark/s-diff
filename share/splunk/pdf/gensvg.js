// Script that generates an SVG file using the Splunk JSCharting library
// exit codes: 0 on success, 1 on error
// stdin: JSON representation of chart data
/* Example data:
{
    "props":  {
        "chart":    "line"
    },
    "series": {
		"fields": ["x", "y"],
		"columns": [[1, 2, 3, 4, 5],
					[1, 4, 9, 16, 25]]
    }
}
*/

// stdout: SVG data
// stderr: debugging/error information

var fs = require('fs');

function debugPrintObject(name, object) {
    process.stderr.write(name + ': ' + JSON.stringify(object) + '\n');
}

function debugPrintError(e) {
    debugPrintObject('error.name', e.name);
    debugPrintObject('error.message', e.message);
    debugPrintObject('error.code', e.code);
    debugPrintObject('error.stack', e.stack);
}

// writeAndFlush
// -------------
// this is necessary since writing to a stream is asynchronous in node
var writeAndFlush = function (data, stream) {
    process.stderr.write('gensvg.js:writeAndFlush\n');
    if (!Buffer.isBuffer(data)) {
        data = new Buffer('' + data);
    }
    if (data.length) {
        var written = 0;
        var retries = 0;
        do {
            try {
                var len = data.length - written;
                written += fs.writeSync(stream.fd, data, written, len, -1);
                retries = 0; // reset retries to zero if writeSync passes correctly
            }
            catch (e) {
                // adding retries here as there are multiple different types
                // of errors that can happen
                // EAGAIN -- since this node processes is non-blocking, we try again if there's an interrupt
                // EPIPE -- broken pipe, this may happen if the pdfgen python process ends prematurely
                //          when this happens, we cannot write to stdout and the pdfgen process should end
                retries++;
                debugPrintError(e);
            }

            if (retries > 100) {
                process.stderr.write('failed writing to stdout after retrying, exiting early');
                process.exit(1);
                break; // needed to break here for testing purposes as we stub process.exit
            }
        } while (written < data.length);
    }
};
module.exports.writeAndFlush = writeAndFlush;

function processChartData(data, outStream) {
    var nodeCharting = require('./node_charting');
    var scriptBasepath = process.env.SPLUNK_HOME + '/share/splunk/search_mrsparkle/exposed/js/';
    nodeCharting.getSVG(data, scriptBasepath, function (err, svg) {
        if (err && err.consoleMessages && err.consoleMessages.length > 0) {
            writeAndFlush('\n' + err.consoleMessages.join('\n') + '\n', process.stderr);
        }
        if (svg === undefined || svg === null || svg.length === 0) {
            var errorMsg = err.message ?
                [err.message.toString(), (err.message.fileName || ''), (err.message.lineNumber || '')].join(' ') :
                JSON.stringify(err);
            writeAndFlush("getSVG error message: " + errorMsg, process.stderr);
            if (err && err.stack) {
                writeAndFlush("\ngetSVG error stack trace: " + err.stack, process.stderr);
            }
            process.exit(1);
        }
        else {
            writeAndFlush(svg, outStream);
            process.exit(0);

        }
    });
}

var stdin = process.openStdin(),
    stdout = process.stdout,
    data = '';
stdin.setEncoding('utf8');

stdout.on('error', function(e) {
    process.stderr.write('encountered error for process.stdout, exiting');
    debugPrintError(e);
    process.exit(1)
});

// data starts as an empty string, we append each chunk, then when we have the whole string we parse and
// hand it off to processChartData

stdin.on('data', function (chunk) {
    data += chunk;
});

stdin.on('end', function () {
    var dataObj = null;
    try {
        dataObj = JSON.parse(data);
    }
    catch (e) {
        writeAndFlush("gensvg args are invalid JSON. data='" + data + "' error='" + e + "'", process.stderr);
        process.exit(1);
    }

    processChartData(dataObj, stdout);
});
