(function () {

    'use strict';

    var stack        = require('callsite'),
        util         = require('util'),
        EventEmitter = require('events').EventEmitter,
        path         = require('path');
//        colors       = require('colors');

    /**
     * consoleOriginal
     *
     * NodeJS console object
     * @type {Object}
     */
    var consoleOriginal = console;

    /**
     * buildTime
     *
     * @param  {timestamp} timestamp
     * @return {String}                  timestamp to String
     */
    var buildTime = function (timestamp) {
        return (new Date(timestamp)).toISOString() + " ";
    };

    /**
     * buildDate
     *
     * @param  {timestamp} timestamp
     * @return {String}             timestamp to string
     */
    var buildDate = function (timestamp) {
        return (new Date(timestamp)).toDateString() + " ";
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


    /*
     * Console2
     *
     * @constructor
     */
    var Console2 = function () {

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
         * Store the file and line 
         *
            {
               filename : 'main.js',
               line : 6
            }
         *
         * @type {Object}
         */
        this._location = {}; 

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
     * @param  {String} filename Optional
     * @param  {Number} line     Optional
     */
    Console2.prototype.file = Console2.prototype.f = function (filename, line) {

        var st = stack()[1];

        if (!filename) {
            filename = path.basename(st.getFileName());
        } else {
            filename = path.basename(filename);
        }

        if (!line) {
            line = st.getLineNumber();
        }

        this._location.filename = filename;
        this._location.line     = line;

        return this;
    };


    /**
     * Console2.prototype.buildMessage
     *
     * @param {Object}  log             The log object
     * @param {Object}  opt             Optional. Options telling what to include in the message
     * @param {Boolean} opt.tags        Optional. Print Tags ? Default false.
     * @param {Boolean} opt.location    Optional. Print location ? Default false.
     * @param {Boolean} opt.time        Optional. Print time ? Default false.
     * @param {Boolean} opt.date        Optional. Print date ? Default false.
     * @return {String}                 The message to print usualy.
     */
    Console2.prototype.buildMessage = function (log, opt) {

        if (!opt) {
            opt = {};
        }

        opt.tags     = opt.tags || false;
        opt.location = opt.location || false;
        opt.time     = opt.time || false;
        opt.date     = opt.date || false;

        var result = "";

        if (opt.time && log.context.time) {
            result += buildTime(log.context.time);
        }

        if (opt.date && log.context.time) {
            result += buildDate(log.context.time);
        }

        if (opt.tags && log.context.tags) {
            result += buildTags(log.context.tags);
        }
        
        if (opt.location && log.context.location.filename && log.context.location.line) {
            result += buildFileInfos(log.context.location);
        }

        if (result.length > 0) {
            //add tab
            result += "        ";
        }

        result += log.argsString;


        return result;

    };



    /**
     * Console2.prototype.addLogger
     *
     * Create a new logger
     * You can then use it with console.myNewLogger
     *
     * @param {String}  name             The name of the logger.
     * @param {String}  color            Optional. Color of the console output. Default blue.
     *                                   See text colors from https://github.com/Marak/colors.js
     * @param {Object}  opt              Options object
     * @param {Boolean} opt.logInConsole Optional. Default true. 
     *                                   Should the logger print to the console ? 
     * @param {Boolean} opt.logInFile    Optional. Default true.
     *                                   If the log should be save in file.
     */
    Console2.prototype.addLogger = function (name, color, opt) {

        if (!opt) {
            opt = {};
        }

        opt.name         = name;
        opt.color        = color || "blue";
        opt.type         = opt.type || opt.name;
        opt.logInConsole = opt.logInConsole || true;
        opt.logInFile    = opt.logInFile || true;

        this[name] = function () {

            //Let's build the log object

            var log = {
                type       : opt.type || name,
                context    : {
                    tags     : this._tags,
                    file     : this._location,
                    time     : Date.now(),
                    location : this._location
                },
                args       : arguments,
                argsString : util.format.apply(console, arguments), //stringify arguments
                opt        : opt
            };

            //Build the string message
            log.message = this.buildMessage(log, {
                tags     : this._tags.length > 0 || false,
                location : this._location.filename || false,
                time     : this._time || false,
                date     : this._date || false
            });

            //Emit events
            this.emit('new', log);
            this.emit(opt.type || name, log);
            
            //If the logger should print the message
            //Print it
            if (opt.logInConsole) {
                global.console.log(log.message);
            }

            this._reset();
        };


    };

    //Keep the old console
    //use also `global.console`
    Console2.prototype.Original = consoleOriginal;
    
    module.exports = Console2;

}());
