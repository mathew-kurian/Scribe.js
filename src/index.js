// Module dependences
var util = require('util')
  , mkdirp = require('mkdirp')
  , path = require('path')
  , moment = require('moment')
  , fs = require('fs');

var APP_NAME = "APP_NAME";
var LOG_PATH = "./..";
var MAIN_USER = "root";

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
        info: { file: true, console: true },
        error: { file: true, console: true },
        warn: { file: true, console: true, },
        realtime: { file: true, console: true },
        high: { file: true, console: true },
        normal: { file: true, console: true },
        low: { file: true, console: true }
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
        preIndent : 5,
        divider : 'W5JZ6WS4GY',
        defaultTag : '[' + APP_NAME + ']', 
        userName : 'unkown'
    }
};

var logpath = LOG_PATH;

var createdir = function(){

    var userName = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'].toLowerCase();
    loggers.settings.userName = userName.slice(userName.lastIndexOf('\\') + 1);

    // Create daily logger directory
    var fpath = path.join(LOG_PATH, "log".toLowerCase());

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
        console.error("[Scribe] Major error detected. Please post an issue on Github.");
        console.error(error);

        throw error;
    }

    return userPath;
}

var overload = function() {

    for(var i in loggers.types)
        console[i] = console.info;

    // Assign this variable as write directory
    var dayiso = moment().isoWeekday(); // FIXME Remove this
    var fpath = logpath = createdir();

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

            // Check if dir up to date
            var diso =  moment().isoWeekday();
            if(dayiso != diso){
                fpath = logpath = createdir();
                dayiso = diso;
            }

            // Important to overload instead of override. This way we can
            // actually reuse the old function.
            var _backup = console[i];
            return function () {
                // We need to apply any formatting from the variables.
                // Notice we don't know the number of arguments, so we
                // use the 'arguments' variable instead.
                var utfs = arguments.length == 1 && typeof arguments[0] === 'object' ? JSON.stringify(arguments[0], null, 4) : util.format.apply(util, arguments).trim()
                  // Moment.js is a great time library for Node.js
                  , mtime = moment().format('h:mm:ss A')
                  // Used to show where the tags are to be placed.
                  // I.e. [Memache] Message goes here.
                  // Coldex holds the index of the first ']'
                  , coldex = 0
                  // The file we are appending to changes everyday since
                  // its directory changes by date.
                  , file = path.join(fpath, 'app.' + i )
                  // Default file type
                  , options = { encoding : 'utf8' }
                  , fullIndent = _sps(loggers.settings.preIndent + loggers.settings.maxTagLength)
                  , defaultTagPostIndent = _sps(loggers.settings.maxTagLength - loggers.settings.defaultTag.length)
                  , temp = ''
                  , preIndent = _sps(loggers.settings.preIndent);

                // Check with logger settings to see if the message should
                // be outputed to file. Note: Don't append empty lines!
                if(loggers.types[i].file && utfs != '')
                    // For large data, block the process when outputting.
                    fs.appendFileSync(file, mtime + loggers.settings.divider + 
                        utfs.stripColors.replace(/\n/g, '\n' + mtime + loggers.settings.divider) + "\n", options, function(err){});
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
        console[i]('[' + APP_NAME + ']' + 'Started - console.%s', i.toUpperCase());
    }

    console.info('\n');

}

// Express middleware logger.
var logger = function(req, res, next) {
    // Important to see who is accessing what and when
    // Should be a printout of every access and its respective data.
    console.info('[%s]%s | %s %s %s' , "Express"
                                , req.ip.red
                                , req.method.green
                                , req.url.grey
                                , (/mobile/i.test(req.headers['user-agent']) ? 'MOBILE' : 'DESKTOP').yellow);

    // Continue with the next process in the Express framework
    next();
}

var datetemplate = fs.readFileSync(__dirname + "/log.html", { encoding : "utf8"});
var rndColors = [ "#16a085", "#27ae60", "#2980b9", "#8e44ad", "#f39c12", "#d35400", "#c0392b", "#7f8c8d"]

var getlog = function(req, res) {
    var date = req.param('date');
    if(typeof date === 'undefined'){ 
        var logs = [];
        var path = LOG_PATH + "/log";
        fs.readdir(path, function(err, files){
            var reponse = datetemplate.replace("TITLE", APP_NAME + " - " + "Scribe.js Control Panel");
            if(err) return res.send(reponse.replace('CONTENT', err));
 
            var loggerDates = "";
            for(var i = 0; i < files.length; i++)
                try {
                    var file = files[i];
                    var fileSplit = file.split("_");
                    var m = fileSplit[0]; 
                    var d = fileSplit[1];
                    var y = "20" + fileSplit[2];
                    loggerDates += '<div style="background:' + rndColors[Math.floor(Math.random() * rndColors.length)] + '"data-types="' + fs.readdirSync(path + '/' + file + "/" +  MAIN_USER + "/").join(',').replace(/app./g, '') + '", data-raw="' + file + '" class="date"><div class="date-month">' + m + '</div><div class="date-day">' + d + '</div><div class="date-year">' + y + '</div></div>';
                } catch(e) {}

            return res.send(reponse.replace('CONTENT', files.join(",")).replace('LOGGER_DATES', loggerDates)
                                                                       .replace('LOG_PATH', LOG_PATH)
                                                                       .replace('LOGGER_USERNAME', MAIN_USER)
                                                                       .replace('DIVIDER', loggers.settings.divider)
                                                                       .replace('COLOR_GEN', rndColors[Math.floor(Math.random() * rndColors.length)]));
        });

        return;
    }

    var type = req.param('type');
    var raw = req.param('raw');
    var contents = "No log found"; 
    
    raw = raw ? true : false;
    type = type ? type : "log";

    var filepath = LOG_PATH + "/log/" + date + "/" + MAIN_USER + "/app." + type;

    if(fs.existsSync(filepath)){
        var stream = fs.createReadStream(filepath);
        res.header('Content-type', 'text/plain');
        res.header('Content-length', fs.statSync(filepath)["size"]);
        stream.pipe(res);
    } else{
       res.statusCode = 404;
       res.send();
    }
}

exports.init = overload;

exports.express = {
    'logger' : logger,
    'getlog' : getlog
}
