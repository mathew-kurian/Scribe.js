(function () {

    'use strict';

    var stack        = require('callsite'),
        util         = require('util'),
        EventEmitter = require('events').EventEmitter,
        path         = require('path'),
        colorsjs     = require('colors/safe');

    /**
     * consoleOriginal
     *
     * NodeJS console object
     * @type {Object}
     */
    var consoleOriginal = console;

    /**
     * getLocation
     *
     * Get location of log.
     * ie. filename and line number
     *
     * @return {Obsject}
     * @return {String}     filename
     * @return {Number}     line
     */
    var getLocation = function () {

        var st     = stack()[2],
            result = {};

        result.filename = path.basename(st.getFileName());
        result.line = st.getLineNumber();

        return result;
    };

    /**
     * buildTime
     *
     * @param  {timestamp} timestamp
     *
     * @return {Object}
     * @return {String} msg          ISO time
     * @return {int}    msgLength
     */
    var buildTime = function (timestamp) {
        var time = (new Date(timestamp)).toISOString();
        return {
            msg       : time,
            msgLength : time.length
        };
    };

    /**
     * buildDate
     *
     * @param  {timestamp} timestamp
     *
     * @return {Object}
     * @return {String} msg        Date to string
     * @return {int}    msgLength
     */
    var buildDate = function (timestamp) {
        var date = (new Date(timestamp)).toDateString();
        return {
            msg       : date,
            msgLength : date.length
        };
    };

    /**
     * buildTags
     *
     * @param  {Array} tags          Tags are string or object {msg :'', colors : []}
     *
     * @return {Object}
     * @return {String} msg          Tags string with colors if given. Ex : "[tag1][tag2]"
     * @return {int}    msgLength    Tags string length (without colors elements)
     */
    var buildTags = function (tags) {

        var result = "",
            length = 0;

        tags.forEach(function (tag) {
            if(typeof tag === "undefined" || tag === null) {
                return;
            }
            if (typeof tag === 'object') {
                result += applyColors('[' + tag.msg + ']', tag.colors);
                length += ("" + tag.msg).length + 2;
            } else {
                result += '[' + tag + ']';
                length += ("" + tag).length + 2;
            }
        });

        return {
            msg       : result,
            msgLength : length
        };
    };

    /**
     * buildFileInfos
     *
     * @param {Object}                  infos
     * @param {String} infos.filename
     * @param {String} infos.line
     *
     * @param {String|Array} fileColors Optional colors.
     * @param {String|Array} lineColors Optional colors.
     *
     * @return {Object}
     * @return {String} msg             File infos with colors if given
     * @return {int}    msgLength
     */
    var buildFileInfos = function (infos, fileColors, lineColors) {

        return {
            msg       : '[' + applyColors(infos.filename, fileColors) + ':' +
                              applyColors(infos.line, lineColors) + ']',
            msgLength : (infos.filename + "" +
                            infos.line).length + 3
        };
    };

    /**
     * areAllStringOrNumber
     *
     * Check in an array contains only string and number
     *
     * @param  {Array} arr
     * @retrun {Boolean}
     */
    var areAllStringOrNumber = function (arr) {
        var result = true;
        arr.forEach(function (elem) {
            if (!(typeof elem === 'string' || typeof elem === 'number')) {
                result = false;
            }
        });

        return result;
    };

    /**
     * applyColors
     *
     * Apply style with colors.js on the console output
     * @param {String}       msg    The msg to stylize
     * @param {Array|String} colors The colors
     *
     * @return {String}
     */
    var applyColors = function (msg, colors) {

        if (!colors) {
            return msg;
        }

        if (typeof colors === 'string') {
            colors = [colors];
        }

        colors.forEach(function (color) {
            if (typeof colorsjs[color] === 'function') {
                msg = colorsjs[color](msg);
            }
        });

        return msg;
    };

    /**
     * spaceLUT
     *
     * Save offset space strings
     */
    var spaceLUT = {};

    /**
     * getSpaces
     *
     * @param  {int}        offset
     * @return {String}     A string of [offset] space
     */
    var getSpaces = function(offset){
        if(typeof spaceLUT[offset] === "undefined"){
            spaceLUT[offset] = new Array(offset).join(' ');
        }
        return spaceLUT[offset];
    };

    /*
     * Console2
     *
     * @constructor
     *
     * @param {Object}       opt                     Optional default options for all loggers.
     * @param {Boolean}      opt.logInConsole        Should all loggers print to console by default ? Default true.
     *
     * @param {int}          opt.contextMediumSize   Medium size of the context part of a log message.
     *                                               Used when calculating indent. Default to 45.
     * @param {int}          opt.spaceSize           Space between context part and log part. Default to 4.
     *
     * @param {Array|String} opt.colors              Default colors output for all loggers. Default ['cyan'].
     * @param {Array|String} opt.tagsColors          Default colors output for tags. Default undefined.
     * @param {Array|String} opt.timeColors          Default colors output for time. Default undefined.
     * @param {Array|String} opt.dateColors          Default colors output for date. Default undefined.
     * @param {Array|String} opt.fileColors          Default colors output for filename. Default undefined.
     * @param {Array|String} opt.lineColors          Default colors output for line number. Default undefined.
     *
     * @param {Boolean}      opt.alwaysTags          Always print tags (even without tag() ). Default false.
     * @param {Boolean}      opt.alwaysLocation      Always print location (even without file() ). Default false.
     * @param {Boolean}      opt.alwaysTime          Always print time (even without time() ). Default false.
     * @param {Boolean}      opt.alwaysDate          Always print date (even without date() ). Default false.
     *
     * @param  {Array}       opt.defaultTags         Default tags to logs with each request. Default [].
     *                                               See this.tag()
     */
    var Console2 = function (opt) {

        if (!opt) {
            opt = {};
        }

        /**
         * opt
         *
         * Constructor opt.
         * Setting default.
         */
        this.opt = {
            logInConsole : opt.logInConsole !== false,

            contextMediumSize : opt.contextMediumSize || 45,
            spaceSize         : opt.spaceSize || 4,

            colors     : opt.colors || "cyan",
            tagsColors : opt.tagsColors,
            timeColors : opt.timeColors,
            dateColors : opt.dateColors,
            lineColors : opt.lineColors,
            fileColors : opt.fileColors,

            alwaysTags     : opt.alwaysTags === true,
            alwaysLocation : opt.alwaysLocation === true,
            alwaysTime     : opt.alwaysTime === true,
            alwaysDate     : opt.alwaysDate === true,

            defaultTags : opt.defaultTags || []
        };

        /**
         * _tags
         *
         * Store all tags for current log
         *
         * @type {Array}
         */
        this._tags = [];

        /**
         *._time
         *
         * Log time (full date) ?
         *
         * @type {Boolean}
         */
        this._time = false;

        /**
         * _date
         *
         * Log date ?
         *
         * @type {Boolean}
         */
        this._date = false;

        /**
         * _location
         *
         * Should we log filename and line number ?
         *
         * @type {Boolean}
         */
        this._location = false;

        /**
         * _reset
         *
         * Reset properties after log
         */
        this._reset = function () {
            this._tags    = [];
            this._time    = false;
            this._date    = false;
            this._location = false;

            return this;
        };

        /**
         * loggers
         *
         * Stores loggers infos
         * @type {Object}
         */
        this.loggers = {};

    };



    // inherits form EventEmitter.prototype
    util.inherits(Console2, EventEmitter);


    /**
     * Console2.prototype.time
     *
     * Log the time
     */
    Console2.prototype.time = function () {
        this._time = true;

        return this;
    };

    /**
     * Console2.prototype.date
     *
     * Log the date
     */
    Console2.prototype.date = function () {
        this._date = true;

        return this;
    };

    /**
     * Console2.prototype.tag
     *
     * Add tags
     * @param  {String|Object} tag
     * @param  {String}        tag.msg    The tag
     * @paral  {String|Array}  tag.colors colors.js colors
     */
    Console2.prototype.tag = Console2.prototype.t = function () {
        var tags = Array.prototype.slice.call(arguments, 0);
        this._tags = this._tags.concat(tags);

        return this;
    };

    /**
     * Console2.prototype.file
     *
     * Log the file name + line
     */
    Console2.prototype.file = Console2.prototype.f = function () {
        this._location = true;

        return this;
    };

    /**
     * Console2.prototype.buildArgs
     *
     * Build the args string
     * ie. the string composed with the arguments send to the logger
     *
     * @param   {Object}  log
     * @return  {String}  the string
     */
    Console2.prototype.buildArgs = function (log, offset, context) {

        var args       = Array.prototype.slice.call(log.args, 0), // transform args in an array
            msg        = "",    // the log message; with newline
            raw        = "";    // no-newlines

        // if all args are string or number, format args as usual
        if (areAllStringOrNumber(args)) {
            raw = util.format.apply(util, args);
            msg = getSpaces(offset) + raw;

        // if objects or array present
        } else {

            var delimiter  = '',
                multiLines = false; // if the log need multiples lines (ie. object, array)

            // Process arg one by one
            args.forEach(function (arg, index) {

                // if arg is an object / array
                // use multiples lines
                if (arg !== null && typeof arg === 'object') {

                    msg += delimiter + JSON.stringify(arg, null, 2);
                    multiLines = true;

                // for "normal" args
                } else {

                    if (multiLines) {
                        msg += delimiter;
                    }

                    msg += (arg + "");
                }

                if(index === 0){
                    delimiter = '\n';
                }
            });

            raw += msg;

            msg = getSpaces(offset) + msg;

            if (multiLines) {
                msg = msg.replace(/\n/gm, '\n' + context + getSpaces(offset));
            }
        }

        return {
            msg : msg,
            raw : raw
        };

    };

    /**
     * Console2.prototype.buildContext
     *
     * Build the context string
     * ie. the string composed with arguments passed to Console2 context functions
     *
     * @param {Object}  log             The log object
     *
     * @param {Object}  opt             Optional options telling what to include in the message
     * @param {Boolean} opt.tags        Print Tags ? Default false.
     * @param {Boolean} opt.location    Print location ? Default false.
     * @param {Boolean} opt.time        Print time ? Default false.
     * @param {Boolean} opt.date        Print date ? Default false.
     *
     * @return {Object}
     * @return {String} result
     * @return {Int}    length          the "human readable" length of the result
     */
    Console2.prototype.buildContext = function (log, opt) {

        if (!opt) {
            opt = {};
        }

        opt.tags     = opt.tags === true;
        opt.location = opt.location === true;
        opt.time     = opt.time === true;
        opt.date     = opt.date === true;

        var result = "",  // final output
            space  = " ", // space between context parts
            length = 0;   // length of the context part (human readable string)
                          // ie. without escapted or colors caracters

        if (opt.tags && log.context.tags) {
            var tags = buildTags(log.context.tags);
            result += applyColors(tags.msg, log.opt.tagsColors) + space;
            length += tags.msgLength + space.length;
        }

        if (opt.location && log.context.location.filename && log.context.location.line) {
            var infos = buildFileInfos(log.context.location, log.opt.fileColors, log.opt.lineColors);
            result += infos.msg + space;
            length += infos.msgLength + space.length;
        }

        if (opt.time && log.context.time) {
            var time = buildTime(log.context.time);
            result += applyColors(time.msg, log.opt.timeColors) + space;
            length += time.msgLength + space.length;
        }

        if (opt.date && log.context.time) {
            var date = buildDate(log.context.time);
            result += applyColors(date.msg, log.opt.dateColors) + space;
            length += date.msgLength + space.length;
        }

        return {
            result : result,
            length : length
        };

    };



    /**
     * Console2.prototype.addLogger
     *
     * Create a new logger
     * You can then use it with console.myNewLogger
     *
     * @param {String}       name                 The name of the logger.
     * @param {Array|String} colors               Optional colorsjs colors of the console output.
     *                                            Override constructor default.
     *                                            See text colors from https:// github.com/Marak/colors.js
     *
     * @param {Object}       opt                  Optional options object. @see Console2 opt for default values.
     *
     * @param {Array|String} opt.tagsColors       Default colors output for tags. Default undefined.
     * @param {Array|String} opt.timeColors       Default colors output for time. Default undefined.
     * @param {Array|String} opt.dateColors       Default colors output for date. Default undefined.
     * @param {Array|String} opt.fileColors       Default colors output for filename. Default undefined.
     * @param {Array|String} opt.lineColors       Default colors output for line number. Default undefined.
     *
     * @param {Boolean}      opt.logInConsole     Should the logger print to the console ?
     * @param {Boolean}      opt.alwaysTags       Always print tags (even without tag() )
     * @param {Boolean}      opt.alwaysLocation   Always print location (even without file() )
     * @param {Boolean}      opt.alwaysTime       Always print time (even without time() )
     * @param {Boolean}      opt.alwaysDate       Always print date (even without date() )
     *
     * @param  {Array}       opt.defaultTags         Default tags to logs with each request. Default undefined.
     *                                               See this.tag()
     */
    Console2.prototype.addLogger = function (name, colors, opt) {

        if (!opt) {
            opt = {};
        }

        if (!name) {
            throw new Error("No name given at addLogger");
        }

        opt.name             = name;
        opt.type             = opt.type || opt.name;

        opt.colors           = colors || this.opt.colors;
        opt.tagsColors       = opt.tagsColors || this.opt.tagsColors;
        opt.timeColors       = opt.timeColors || this.opt.timeColors;
        opt.dateColors       = opt.dateColors || this.opt.dateColors;
        opt.fileColors       = opt.fileColors || this.opt.fileColors;
        opt.lineColors       = opt.lineColors || this.opt.lineColors;

        opt.logInConsole     = opt.logInConsole || this.opt.logInConsole;
        opt.alwaysTags       = opt.alwaysTags || this.opt.alwaysTags;
        opt.alwaysLocation   = opt.alwaysLocation || this.opt.alwaysLocation;
        opt.alwaysTime       = opt.alwaysTime || this.opt.alwaysTime;
        opt.alwaysDate       = opt.alwaysDate || this.opt.alwaysDate;

        opt.defaultTags      = Array.isArray(opt.defaultTags) ?
                                opt.defaultTags.concat(this.opt.defaultTags)
                                : this.opt.defaultTags;

        /**
         * this.[name]
         *
         * @params              anything you want, printf formar, etc.
         * @return  {Console2}  this
         */
        this[name] = function () {

            var location = getLocation();
            var time     = Date.now();

            // Let's build the log object

            var log = {
                type       : opt.type || name,
                show       : {
                    tags     : this._tags.length > 0 || this.opt.alwaysTags || opt.defaultTags.length > 0,
                    location : this._location || this.opt.alwaysLocation,
                    time     : this._time || this.opt.alwaysTime,
                    date     : this._date || this.opt.alwaysDate
                },
                context    : {
                    tags     : opt.defaultTags.concat(this._tags),
                    file     : this._location,
                    time     : time,
                    location : location
                },
                args       : arguments,
                opt        : opt
            };

            // Build the context string
            var context = this.buildContext(log, log.show);

            // Generate the according number of space between context and args strings
            // add space according to the contextMediumSize
            var offset = Math.max(0, this.opt.contextMediumSize - context.length);

            // save context
            log.contextString = context.result;

            // Build the args string
            var built = this.buildArgs(log, offset, log.contextString);

            // newline enabled
            log.argsString = built.raw;

            // Finally, the message
            log.message = log.contextString + log.argsString;

            // Emit events
            this.emit('new', log, log.type); // 'new' event

            var msg = log.type;

            /*
             * EventEmitter.emit() will raise an Error
             * if we emit the event 'error' and there is no listeners
             * For now, transform 'error' in 'errorEvent'
             */
            if (msg === 'error') {
                msg += 'Event';
            }
            this.emit(msg, log); // `log.type` event

            // If the logger should print the message
            // Print it
            if (opt.logInConsole) {
                global.console.log(applyColors(log.contextString + built.msg, opt.colors));
            }

            this._reset();

            return this;
        };

        this.loggers[name] = opt;

        this.emit('newLogger', name, opt);

    };

    // Keep the old console
    // use also `global.console`
    Console2.prototype.Original = consoleOriginal;

    module.exports = Console2;

}());
