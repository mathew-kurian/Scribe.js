// Module dependences
var util = require('util')
  , mkdirp = require('mkdirp')
  , path = require('path')
  , moment = require('moment')
  , fs = require('fs');

var APP_NAME = "AppName";

// Logger information which will be read by the 'overload' function when
// assigning the roles of each I/O scribes.
var loggers = {
    types : {
        // Method to override
        log: {
            // File storage?
            file: true,
            // Prinout to console?
            console: true,
        },
        info: {
            file: true,
            console: true
        },
        error: {
            file: true,
            console: true
        },
        warn: {
            file: true,
            console: true,
        },
        realtime: {
            file: true,
            console: true
        },
        high: {
            file: true,
            console: true
        },
        normal: {
            file: true,
            console: true
        },
        low: {
            file: true,
            console: true
        }
    },
    colors : {
        // Console tag colors
        info: 'green',      // Done events
        log: 'yellow',      // Large data
        warn: 'cyan',       // To do events
        error: 'red' ,       // To do events
        realtime: 'blue',
        high: 'magenta',
        normal: 'grey',
        low: 'grey'
    },
    settings : { 
        maxTagLength : 30,
        maxLineWidth : 500,
        preIndent : 5,
        divider : ' : ',
        defaultTag : '[' + APP_NAME + ']', 
        userName : 'unkown'
    }
};

var overload = function() {

    // Additional transports
    console.realtime = console.info;
    console.high = console.info;
    console.normal = console.info;
    console.low = console.info;

    var userName = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'].toLowerCase();
    loggers.settings.userName = userName.slice(userName.lastIndexOf('\\') + 1);

    // Create daily logger directory
    var fpath = path.join(__dirname, "log".toLowerCase());

    // Create daily logger directory
    var dailyPath = path.join(fpath, moment().format('MMM_D_YY').toLowerCase());

    // Create user directories
    var userPath = path.join(dailyPath, loggers.settings.userName);

    try
    {
        // Create directories syncrhonized.
        mkdirp.sync(fpath, 0777 & (~process.umask()));
        mkdirp.sync(dailyPath, 0777 & (~process.umask()));
        mkdirp.sync(userPath, 0777 & (~process.umask()));
    }
    catch(error)
    {
        console.log("[Scribe] Major error detected. Post an issue on github with this error.");
        console.log(error);

        throw error;
    }

    // Assign this variable as write directory
    fpath = userPath;

    var _sps = function(sp){
        var s = '';
        for(var z = 0; z < sp; z++)
            s += ' ';
        return s;
    }

    // Authorize and overload the loggers
    for (var m in loggers.types) {
        // Override the console defaults by creating an anonymous namespace
        // that returns a new function that is used instead of the existing
        // function.
        console[m] = (function (i) {
            // Important to overload instead of override. This way we can
            // actually reuse the old function.
            var _backup = console[i];
            return function () {
                // We need to apply any formatting from the variables.
                // Notice we don't know the number of arguments, so we
                // use the 'arguments' variable instead.
                var utfs = util.format.apply(util, arguments)
                  // Moment.js is a great time library for Node.js
                  , mtime = moment().format('MMMM Do YYYY, h:mm:ss A')
                  // Replace any linebreaks and leading/trailing white
                  // space. But we attach a line break at the end to show
                  // each line in the scribe outputs.
                  , ltfs = i == 'log' ? utfs : utfs.replace(/\n/g, '').trim()
                  // Used to show where the tags are to be placed.
                  // I.e. [Memache] Message goes here.
                  // Coldex holds the index of the first ']'
                  , coldex = 0
                  // The file we are appending to changes everyday since
                  // its directory changes by date.
                  , file = path.join(fpath, 'app.' + i )
                  // Stripped and cleaned string for output to file.
                  // This is different from the console output which has
                  // color formatting. This formatting can cause a lot of
                  // gibberish in textfiles which make it hard to read.
                  // So that is why we strip it out strings that are going
                  // to be saved into the file. Read below for more info
                  // regarding the async/sync formats.
                  , foutstrAsync = ltfs.stripColors + '\n'
                  , foutstrSync = utfs.stripColors.replace(/\n/g, '\n' + _sps(mtime.length + loggers.settings.divider.length)) + '\n'
                  // Default file type
                  , options = { encoding : 'utf8' }
                  , fullIndent = _sps(loggers.settings.preIndent + loggers.settings.maxTagLength)
                  , defaultTagPostIndent = _sps(loggers.settings.maxTagLength - loggers.settings.defaultTag.length)
                  , temp = ''
                  , preIndent = _sps(loggers.settings.preIndent);
                // Check with logger settings to see if the message should
                // be outputed to file. Note: Don't append empty lines!
                if(loggers.types[i].file && ltfs != '')
                    // Asynchrounous ouput which should not block existing
                    // code. Basically, a form of 'process.fork(...)'
                    if(utfs.length < loggers.settings.maxLineWidth)
                        // For small data, don't block current process.
                        // NOTE: Fix to Async and Sync
                        //       03/16/2013
                        // FIXED : Problem was the EACH function which wasn't
                        //         chaining.
                        //         03/16/2013
                        fs.appendFileSync(file, mtime + loggers.settings.divider + foutstrAsync, options, function(err){});
                    else
                        // For large data, block the process when outputting.
                        fs.appendFileSync(file, mtime + loggers.settings.divider + foutstrSync, options, function(err){});
                // Check whether the message should be outputed to console.
                // Usually, long strings are marked as output ONLY to file
                // and NOT to console. Short and important messages are
                // usually outputed to BOTH.
                if (loggers.types[i].console){
                    // See if a tag exists and if so, colorize it.
                    if ((coldex = utfs.indexOf(']') + 1) <= loggers.settings.maxTagLength && utfs.indexOf(']') > -1)
                        _backup(preIndent + utfs.substring(0, coldex)[i] + (temp = _sps(loggers.settings.maxTagLength - coldex)) + utfs.substring(coldex).replace(/\n/g, '\n' + preIndent + utfs.substring(0, coldex)[i] + temp));
                    // No tag? Just pring the whole message out.
                    else if(utfs.trim() != '')
                        _backup( (temp = preIndent + loggers.settings.defaultTag[i] + defaultTagPostIndent) + utfs.replace(/\n/g, '\n' + temp));
                    // If the content is just a linebreak or some spaces, just output as it is.
                    else
                        _backup(utfs);
                }
            }
        })(m);
    }

    // String.prototype with basic methods.
    // Override default styles
    require('colors').setTheme(loggers.colors);

    // Basic banner indicating its Turredo output in the command prompt.
    // Just for fancies and it helps keep track the number of restarts.

    console.info('\n');

    for(var i in loggers.types) {
        console[i]('========================================================='[i]);
        console[i]((APP_NAME + ' Server 1 Application.%s | Newline.%s')[i], i.toUpperCase()
                                                                    , [i] == 'log' ? 'DISABLED' : 'ENABLED');
        console[i](moment().format('LLL')[i]);
        console[i]('========================================================='[i]);
    }

    console.info('\n');

}

// Express middleware logger.
var logger = function(req, res, next) {
    // Important to see who is accessing what and when
    // Should be a printout of every access and its respective data.
    console.info('[%s]%s %s %s' , req.ip
                                , req.method.red
                                , req.url
                                , (/mobile/i.test(req.headers['user-agent']) ? 'MOBILE' : 'DESKTOP').yellow);

    // Continue with the next process in the Express framework
    next();
}

exports.overload = overload;
exports.logger = logger;

// Initialize
overload();