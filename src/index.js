// Module dependences
var util = require('util')
  , mkdirp = require('mkdirp')
  , path = require('path')
  , moment = require('moment')
  , fs = require('fs');

var APP_NAME = "APP_NAME";
var LOG_PATH = __dirname + "/log";

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

    // Additional transports
    console.realtime = console.info;
    console.high = console.info;
    console.normal = console.info;
    console.low = console.info;
   
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
                  , mtime = moment().format('MMMM Do YYYY, h:mm:ss A')
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

var htmltemplate = "";
var css = {};
css['html,body'] = 'margin:0; border:none;float:none;display:block;padding:0;font-family:Consolas,Menlo,Monaco,Lucida Console,Liberation Mono,DejaVu Sans Mono,Bitstream Vera Sans Mono,Courier New,monospace,serif;background:#1c262f;overflow:hidden;';
css['div'] =  'font-family:Consolas,Menlo,Monaco,Lucida Console,Liberation Mono,DejaVu Sans Mono,Bitstream Vera Sans Mono,Courier New,monospace,serif;font-size:11px;';
css['html'] = 'background:#2A3946;padding:0;padding-left:50px;'
css['body'] = 'border-left: 1px solid rgba(255, 255, 255, 0.12);';
css['.log-time'] = 'background: none;color: rgba(255, 255, 255, 0.24);padding:2px 5px;margin-right:2px;margin-left:-1px;font-size:11px;';
css['.log-type'] = 'background: #633E3E;color: #C20404;padding:2px 5px;margin-right:2px;font-size:11px;';
css['.log-line'] = 'height:auto;line-height:15px;color:#BEBEBE;font-size:11px;'
css['.button, .selected'] = "font-family:Consolas,Menlo,Monaco,Lucida Console,Liberation Mono,DejaVu Sans Mono,Bitstream Vera Sans Mono,Courier New,monospace,serif;background:#2C3338;text-align:center;width:100%;line-height:35px;height:35px;margin-bottom:5px;box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.11);"
css['.selected'] = "background:#4D5961;"
css['a'] = "background:none;text-decoration:none;font-size: 11px;color: #C2C2C2;padding: 10px;"

htmltemplate+= "<head><title>TITLE</title><style>"
for(var i in css)   htmltemplate+= i + "{" + css[i] + "}";
htmltemplate += "</style></head>";
var buttons = '<div style = "position:fixed;top:5px;left:5px;width:40px;height:100px;">' +
                    '<div class="button info_selected"><a href="log?type=info">I</a></div>' +
                    '<div class="button log_selected"><a href="log?type=log">L</a></div>' +
                    '<div class="button error_selected"><a href="log?type=error">E</a></div>' +
                    '<div class="button warn_selected"><a href="log?type=warn">W</a></div>' +
                    '<div class="button realtime_selected"><a href="log?type=realtime">Re</a></div>' +
                    '<div class="button high_selected"><a href="log?type=high">Hi</a></div>' +
                    '<div class="button normal_selected"><a href="log?type=normal">No</a></div>' +
                    '<div class="button low_selected"><a href="log?type=low">Lo</a></div>' +
                '</div>'
htmltemplate += '<body style="position:relative;"><div style="position:absolute;left:0;top:0;bottom:0;right:0;"><div style="width:100%;height:100%;overflow:auto;"><div style="width:100%;height:auto;">CONTENT</div></div></div>' + buttons + '</body>';
htmltemplate = "<html>" + htmltemplate + "</html>";

var divRegex = loggers.settings.divider.replace(/([\||\$|\^|\?|\[|\]|\)|\(|\{|\}])/g, '\\$1');
var regA = new RegExp('^(.*?)(' + divRegex + ")", 'mg');
var regB = new RegExp('^(.*?)' + divRegex + '\\s{0,}\\[(.*?)\\](.*?)$', 'gm') 
var regC = new RegExp('^(.*?)' + divRegex,'mg');

var getlog = function(req, res) {
    var type = req.param('type');
    type = type ? type : "log";
    var contents = "No log found";
    fs.readFile(logpath + "/app." + type, 'utf8', function(err, data) {
        if (!err) contents = data;
        // contents = contents.replace(/^(.*?)#\|#/mg, '<span class = "log-time">$1</span>#\|#')
        contents = contents.replace(/ /g, '&nbsp;')
        contents = contents.replace(regA, '<span class = "log-time">$1</span>$2');
        contents = contents.replace(regB, '$1<span class = "log-type">$2</span>$3');
        contents = contents.replace(regC, '$1')
        contents = contents.replace(/^(.*?)$/mg, '<div class = "log-line">$1</div>')
        var response = htmltemplate.replace(type + '_', '').replace("CONTENT", contents).replace("TITLE", APP_NAME + " - " + type);
        res.send(response);
    });
}

exports.init = overload;

exports.express = {
    'logger' : logger,
    'getlog' : getlog
}
