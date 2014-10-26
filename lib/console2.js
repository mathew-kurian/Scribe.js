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
     * @return {String}                  timestamp to String
     */
    var buildTime = function (timestamp) {
        return (new Date(timestamp)).toISOString();
    };

    /**
     * buildDate
     *
     * @param  {timestamp} timestamp
     * @return {String}             timestamp to string
     */
    var buildDate = function (timestamp) {
        return (new Date(timestamp)).toDateString();
    };

    /**
     * buildTags
     *
     * @param  {Array} tags
     * @return {String}     "[tag1][tag2]"
     */
    var buildTags = function (tags) {
        return '[' + tags.join('][') + ']';
    };

    /**
     * buildFileInfos
     *
     * @param {Object} infos
     * @param {String} infos.filename
     * @param {String} infos.line
     */
    var buildFileInfos = function (infos) {
        return '[' + infos.filename + ':' + infos.line + ']';
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
            colors = [];
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

    /*
     * Console2
     *
     * @constructor
     *
     * @param {Object}       opt                     Optional default options for all loggers.
     * @param {Boolean}      opt.logInConsole        Should all loggers print to console by default ? Default true.
     * @param {Boolean}      opt.logInFile           Should all loggers saver log in file by default ? Default true.
     *
     * @param {int}          opt.contextMediumSize   Medium size of the context part of a log message.
     *                                               Used when calculating indent. Default to 45.
     * @param {int}          opt.spaceSize           Space between context part and log part. Default to 4.
     * @param {Array|String} opt.colors              Default colors output for all loggers. Default ['cyan'].
     * 
     * @param {Boolean}      opt.alwaysTags          Always print tags (even without tag() ). Default false.
     * @param {Boolean}      opt.alwaysLocation      Always print location (even without file() ). Default false.
     * @param {Boolean}      opt.alwaysTime          Always print time (even without time() ). Default false.
     * @param {Boolean}      opt.alwaysDate          Always print date (even without date() ). Default false.
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
            logInFile    : opt.logInFile !== false,

            contextMediumSize : opt.contextMediumSize || 45,
            spaceSize         : opt.spaceSize || 4,

            colors : opt.colors || "cyan",

            alwaysTags     : opt.alwaysTags === true,
            alwaysLocation : opt.alwaysLocation === true,
            alwaysTime     : opt.alwaysTime === true,
            alwaysDate     : opt.alwaysDate === true
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
            this.location = false;
    
            return this;
        };
    
    
    };



    //inherits form EventEmitter.prototype
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
     * @param  {*} tag 
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
     * Console2.prototype.buildMessage
     *
     * @param {Object}  log             The log object
     *
     * @param {Object}  opt             Optional options telling what to include in the message
     * @param {Boolean} opt.tags        Print Tags ? Default false.
     * @param {Boolean} opt.location    Print location ? Default false.
     * @param {Boolean} opt.time        Print time ? Default false.
     * @param {Boolean} opt.date        Print date ? Default false.
     *
     * @return {String}                 The message to print usualy.
     */
    Console2.prototype.buildMessage = function (log, opt) {

        if (!opt) {
            opt = {};
        }

        opt.tags     = opt.tags === true;
        opt.location = opt.location === true;
        opt.time     = opt.time === true;
        opt.date     = opt.date === true;

        var result = "";

        if (opt.tags && log.context.tags) {
            result += buildTags(log.context.tags) + " ";
        }
        
        if (opt.location && log.context.location.filename && log.context.location.line) {
            result += buildFileInfos(log.context.location) + " ";
        }
        
        if (opt.time && log.context.time) {
            result += buildTime(log.context.time) + " ";
        }

        if (opt.date && log.context.time) {
            result += buildDate(log.context.time) + " ";
        }

        if (result.length > 0) { //if there is context string
            //add space according to the contextMediumSize 
            var offset = this.opt.contextMediumSize  - result.length;
            
            if (offset < 0) { //context string could be longer than medium size
                offset = 0;
            }

            result += new Array(offset + this.opt.spaceSize).join(' ');
        }

        //It's time to log the args

        var args       = Array.prototype.slice.call(log.args, 0), //transform args in an array
            msg        = "",    //the log message
            delimiter  = '\n\n',
            multiLines = false; //if the log need multiples lines (ie. object, array)

        //Process arg one by one
        args.forEach(function (arg) {
            
            //if arg is an object / array
            //use multiples lines
            if (arg !== null && typeof arg === 'object') {

                msg += delimiter;

                msg += JSON.stringify(arg, null, 2);

                multiLines = true;

            //for "normal" args
            } else {
                if (multiLines) {
                    msg += delimiter;
                }
                msg += arg + "";
            }
        });

        if (multiLines) {
            msg += '\n';
            msg = msg.replace(/\n/gm, '\n' + new Array(this.opt.spaceSize).join(' '));
        }

        result += msg;

        return result;

    };



    /**
     * Console2.prototype.addLogger
     *
     * Create a new logger
     * You can then use it with console.myNewLogger
     *
     * @param {String}  name                 The name of the logger.
     * @param {String}  colors               Optional. Colors of the console output. Default cyan.
     *                                       See text colors from https://github.com/Marak/colors.js
     *
     * @param {Object}  opt                  Optional options object. @see Console2 opt for default values.
     * @param {Boolean} opt.logInConsole     Should the logger print to the console ? 
     * @param {Boolean} opt.logInFile        If the log should be save in file.
     * @param {Boolean} opt.alwaysTags       Always print tags (even without tag() )
     * @param {Boolean} opt.alwaysLocation   Always print location (even without file() )
     * @param {Boolean} opt.alwaysTime       Always print time (even without time() )
     * @param {Boolean} opt.alwaysDate       Always print date (even without date() )
     */
    Console2.prototype.addLogger = function (name, colors, opt) {

        if (!opt) {
            opt = {};
        }
        
        if (!name) {
            throw new Error("No name given at addLogger");
        }

        opt.name             = name;
        opt.colors           = colors || this.opt.colors;
        opt.type             = opt.type || opt.name;
        opt.logInConsole     = opt.logInConsole || this.opt.logInConsole;
        opt.logInFile        = opt.logInFile || this.opt.logInFile;
        opt.alwaysTags       = opt.alwaysTags || this.opt.alwaysTags;
        opt.alwaysLocation   = opt.alwaysLocation || this.opt.alwaysLocation;
        opt.alwaysTime       = opt.alwaysTime || this.opt.alwaysTime;
        opt.alwaysDate       = opt.alwaysDate || this.opt.alwaysDate;


        this[name] = function () {

            var location = getLocation();
            var time     = Date.now();

            //Let's build the log object

            var log = {
                type       : opt.type || name,
                context    : {
                    tags     : this._tags,
                    file     : this._location,
                    time     : time,
                    location : location
                },
                args       : arguments,
                argsString : util.format.apply(console, arguments), //stringify arguments
                opt        : opt
            };

            //Build the string message
            log.message = this.buildMessage(log, {
                tags     : this._tags.length > 0 || this.opt.alwaysTags,
                location : this._location || this.opt.alwaysLocation,
                time     : this._time || this.opt.alwaysTime,
                date     : this._date || this.opt.alwaysDate
            });

            //Emit events
            this.emit('new', log, log.type);
            this.emit(log.type, log);
            
            //If the logger should print the message
            //Print it
            if (opt.logInConsole) {
                global.console.log(applyColors(log.message, opt.colors));
            }

            this._reset();
        };


    };

    //Keep the old console
    //use also `global.console`
    Console2.prototype.Original = consoleOriginal;
    
    module.exports = Console2;

}());
