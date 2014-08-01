// Scribe.js (NodeJS)
// Mathew Kurian

// Module dependences
// ---------------------------------

var util = require('util');
var mkdirp = require('mkdirp');
var path = require('path');
var moment = require('moment');
var fs = require('fs');
var stack = require('callsite');
var colors = require('colors');

var self = module.exports;
self.express = {};

// Configuration
// ---------------------------------

var $ = {
    app: "scribe.js",
    logPath: "./../logs",
    mainUser: "root",
    maxTagLength: 50,
    indentation: 2,
    divider: ':::',
    defaultUserDir: '_user',
    testOutput: function(result, pipes, actual, expected, opts) {

        var pipe = result ? 'log' : 'error';
        var ne = expected.indexOf("\n") > -1;
        var na = actual.indexOf("\n") > -1;

        pipes[pipe]((" " + opts + " ").bold.inverse + (result ? " PASSED ".green : " FAILED ".red).bold.inverse);
        pipes[pipe](" EXPECTED " [result ? "green" : "red"].bold.inverse + " " + (!ne ? expected : ""));
        if (ne) {
            pipes[pipe](expected);
        }
        pipes[pipe](" ACTUAL " [result ? "green" : "red"].bold.inverse + " " + (!na ? actual : ""));
        if (na) {
            pipes[pipe](actual);
        }
    }
};


// Active settings
// ---------------------------------

var activeDefaultTag;
var activeUserDir;
var activeDateDir;
var activeDayIso;
var activeDir;

var loggers = {};
var theme = {};
var fsOptions = {
    encoding: 'utf8'
};
var __reserved = ["f", "t", "tag", "file", "should", "be", "test", "assert"];

// Cache pipe out
// ---------------------------------

var __stdpipe = (function() {
    return console.log;
})();

// Utility functions
// ---------------------------------

var pretty = function(a) {
    if (!a) {
        return a + "";
    }
    if (typeof a === 'object') {
        return JSON.stringify(a, null, 4);
    }
    return a.toString();
};

var compress = function(a) {
    if (!a) {
        return a + "";
    }
    if (typeof a === 'object') {
        return JSON.stringify(a);
    }
    return a.toString();
};

var tag = function(a) {
    return "[" + a + "]";
};

var createDir = function() {
    mkdirp.sync(path.normalize($.logPath), 0777 & (~process.umask()));
    mkdirp.sync(path.normalize(path.join($.logPath, activeDateDir)), 0777 & (~process.umask()));
    mkdirp.sync(activeDir = path.normalize(path.join($.logPath, activeDateDir, activeUserDir)), 0777 & (~process.umask()));
};

var getUser = function() {
    try {
        activeUserDir = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'].toLowerCase();
        activeUserDir = activeUserDir.slice(activeUserDir.lastIndexOf((process.platform === 'win32') ? '\\' : '/') + 1);
    } catch (e) {
        activeUserDir = $.defaultUserDir;
    } finally {
        return activeUserDir;
    }
};

var validate = function() {
    var _activeDayIso = moment().day();
    if (activeDayIso !== _activeDayIso) {
        activeDayIso = _activeDayIso;
        activeDateDir = moment().format('MMM_D_YY').toLowerCase();
        return true;
    }

    return false;
};

function Extender(tag, opts, mode) {

    var self = this;

    self.tag = tag;
    self.opts = opts;
    self.mode = mode;

    self.do = self.invoke = self.should = function(actual) {

        var _actual = compress(actual);

        self.expect = self.be = function(expected) {

            var _expected = compress(expected);

            $.testOutput(_actual === _expected, self, pretty(actual), pretty(expected), self.opts);

            return self;
        };

        return self;
    };
}

var spaces = function(sp) {
    var s = '';
    for (var z = 0; z < sp; z++) {
        s += ' ';
    }
    return s;
};

var stackTag = function(_stack) {
    try {
        return tag(path.basename(_stack.getFileName()) + ":" + _stack.getLineNumber());
    } catch (e) {
        return tag(activeDefaultTag);
    }
};

// Exports
// ---------------------------------

self.addLogger = function(name, file, console, color) {
    if (arguments.length < 4) {
        return false;
    }

    if (__reserved.indexOf(name) > -1) {
        throw Error("Reserved pipe - " + name);
    }

    theme[name] = color;
    loggers[name] = {
        "file": file,
        "console": console
    };

    colors.setTheme(theme);

    addPipe(name);

    return true;
};

exports.removeLogger = function(name) {
    if (loggers[name]) {
        delete loggers[name];
        delete console[name];
        return true;
    }

    return false;
};

self.set = function(a, b) {
    $[a] = b;
};

self.configure = function(callback) {

    var _logPath = $.logPath;
    var _activeUserDir = activeUserDir;

    if (callback) {
        callback();
    }

    activeDefaultTag = tag($.app.toLowerCase());
    activeUserDir = getUser();

    if ($.logPath !== _logPath) {
        if (_logPath) {
            fs.unlink(_logPath, function() {});
        }
    } else if (_activeUserDir !== activeUserDir) {
        if (_activeUserDir) {
            fs.unlink(_activeUserDir, function() {});
        }
    }

    validate();
    createDir();
};

self.express.logger = function(validate) {

    return function(req, res, next) {

        if (!validate || validate(req, res)) {
            console.info('[%s]%s %s %s %s', "express.js", req.ip.red, req.method.green, req.url.grey, (/mobile/i.test(req.headers['user-agent']) ? 'MOBILE' : 'DESKTOP').yellow);
        }

        next();
    };
};

self.express.webpipe = function() {

    self.addLogger('user', true, true, 'magenta');

    return function(req, res) {
        console.t('scribe.js').user(req.ip.red + " " + req.body.data);
        res.send('received');
    };
};

// Web Control Panel
// ---------------------------------

var datetemplate = fs.readFileSync(path.join(__dirname, "/log.html"), {
    encoding: "utf8"
});
var flatColors = ["#16a085", "#27ae60", "#2980b9", "#8e44ad", "#f39c12", "#d35400", "#c0392b", "#7f8c8d"];

self.express.controlPanel = function() {

    return function(req, res) {
        var date = req.param('date');

        if (!date) {

            var datePath = path.normalize(path.join($.logPath));

            fs.readdir(datePath, function(err, files) {

                if (err) {
                    console.error(err);
                    return res.send(err);
                }

                var loggerDates = "";

                for (var i = 0; i < files.length; i++) {
                    try {
                        var file = files[i];
                        var fileSplit = file.split("_");
                        loggerDates += '<div style="background:' +
                            flatColors[Math.floor(Math.random() * flatColors.length)] + '"data-types="' +
                            fs.readdirSync(path.join(datePath, file, $.mainUser)).join(',').replace(/app./g, '') + '", data-raw="' +
                            file + '" class="date"><div class="date-month">' + fileSplit[0] + '</div><div class="date-day">' +
                            fileSplit[1] + '</div><div class="date-year">' + ("20" + fileSplit[2]) + '</div></div>';
                    } catch (e) {
                        continue;
                    }
                }

                return res.send(datetemplate.replace("__title", $.app + " - Scribe.js Control Panel")
                    .replace('__content', files.join(","))
                    .replace('__logdates', loggerDates)
                    .replace('__logpath', activeDir)
                    .replace('__username', $.mainUser)
                    .replace('__divider', $.divider));
            });

            return;
        }

        var type = req.param('type');
        type = type ? type : "log";

        var filepath = path.join(activeDir, "app." + type);

        if (fs.existsSync(filepath)) {
            var stream = fs.createReadStream(filepath);

            res.writeHead(200, {
                'Content-Length': fs.statSync(filepath).size,
                'Content-Type': 'text/plain',
            });

            stream.pipe(res);
        } else {
            res.statusCode = 404;
            res.send();
        }
    };
};

// Additional Features
// ---------------------------------

console.t = function(n, _) {
    n = _ ? _ + ":" + n : n;
    var _tag = n;
    var ext = new Extender(n ? tag(n) : activeDefaultTag);
    ext.t = function() {
        return console.t.call(console, arguments[0], _tag);
    };

    ext.t = function() {
        return console.t.call(console, arguments[0], _tag);
    };

    return ext;
};

console.f = function(n, _) {

    if (!n) {
        var st = stack()[1];
        n = path.basename(st.getFileName());
    } else {
        n = path.basename(n);
    }

    (n = _ ? _ + ":" + n : n);

    var _tag = n;
    var ext = new Extender(n ? n : activeDefaultTag, undefined, "f");

    ext.f = function() {
        return console.f.call(console, arguments[0], _tag);
    };

    ext.t = function() {
        return console.t.call(console, arguments[0], _tag);
    };

    return ext;
};

Extender.prototype.test =
Extender.prototype.asset =
console.assert =
console.test = function(name, tag) {
    tag = tag ? tag : stackTag(stack()[1]);
    return new Extender(tag, name, stack()[1]);
};

function addPipe(n) {

    Extender.prototype[n] = function() {
        var args = Array.prototype.splice.call(arguments, 0);
        if (this.mode === "f") {
            var st = stack()[1];
            args.unshift(tag(this.tag + ":" + st.getLineNumber()) + args.shift());
        } else {
            args.unshift(this.tag + args.shift());
        }
        console[n].apply(this, args);
    };

    console[n] = (function(i) {

        if (validate()) {
            createDir();
        }

        return function() {

            var utfs = (arguments.length === 1 ? pretty(arguments[0]) : util.format.apply(util, arguments)).trim();
            var time = moment().format('h:mm:ss A');
            var file = path.join(activeDir, 'app.' + i);
            var indent = spaces($.indentation);
            var tag = utfs.match(/^\[(.*?)\]\s{0,}/m);
            var cleanTag;

            if (loggers[i].file && utfs) {

                var outfs = utfs.stripColors;
                cleanTag = "";

                if (tag) {
                    outfs = outfs.replace(tag[0], "");
                    cleanTag = tag[0].trim();
                }

                outfs = time + $.divider + cleanTag + outfs.replace(/\n/g, '\n' + time + $.divider + cleanTag) + '\n';

                fs.appendFileSync(file, outfs, fsOptions, function() {});
            }

            if (loggers[i].console) {

                if (!tag) {
                    tag = [stackTag(stack()[1])];
                }

                var tabIn;
                cleanTag = tag[0].trim();

                if (cleanTag.length <= $.maxTagLength) {
                    utfs = utfs.replace(tag[0], "");
                    tabIn = spaces($.maxTagLength - cleanTag.length);
                    cleanTag = cleanTag[i].bold;
                    utfs = indent + cleanTag + tabIn + utfs.replace(/\n/g, '\n' + indent + cleanTag + tabIn);
                } else {
                    tabIn = indent + spaces($.maxTagLength);
                    utfs = tabIn + utfs.replace(/\n/g, '\n' + tabIn);
                }

                __stdpipe(utfs);
            }
        };

    })(n);

    // console.t()[n]('Created pipe console.%s', n.toUpperCase());
}

// Startup
$.mainUser = activeUserDir = getUser();
self.configure();

// Express missing notification
try {
    var express = require("express");
    if (!express) {
        throw new Error();
    }
} catch (e) {
    console.warn("SCRIBE WARNING: Express not installed - visual web logger is disabled.");
}