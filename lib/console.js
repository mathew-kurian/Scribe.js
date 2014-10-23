(function () {

    'use strict';

    var stack        = require('callsite'),
        util         = require('util'),
        EventEmitter = require('EventEmitter'),
        path         = require('path');
//        colors       = require('colors');

    /**
     * consoleOriginal
     *
     * NodeJS console object
     * @type {Object}
     */
    var consoleOriginal = console;

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
         * _day
         *
         * Log day ?
         * 
         * @type {Boolean}
         */
        this._day = false;
    
        /**
         * _location
         *
         * Store the file and line 
         * 
         * @type {Object|Null}
         */
        this._location = null; 

        /**
         * _reset
         *
         * Reset properties after log
         */
        this._reset = function () {
            this._tags    = [];
            this._time    = true;
            this._day     = false;
            this.location = false;
    
            return this;
        };
    
    
    };


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
     * Console2.prototype.day
     *
     * Log the day
     */
    Console2.prototype.day = function () {
        this._day = true;

        return this;
    };

    /**
     * Console2.prototype.tag
     *
     * Add tags
     * @param  {String} tag 
     */
    Console2.prototype.tag = Console2.prototype.t = function () {
        this._tags.push(arguments);
        
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

        this._location.file = filename;
        this._location.line = line;

        return this;
    };


    /**
     * Console2.prototype.addLogger
     * 
     * @param {[type]} name         [description]
     * @param {[type]} color        [description]
     * @param {[type]} logInConsole [description]
     * @param {[type]} logInFile    [description]
     * @param {[type]} opt          Options object
     */
    Console2.prototype.addLogger = function (name, color, logInConsole, logInFile, opt) {

        this[name] = function () {

            //Let's build the log object

            var log = {
                type    : opt.type || name,
                args    : arguments,
                message : util.format.apply(console, arguments) //stringify arguments
            };

            

            if (logInConsole) {
                //print object
                //Use old console or process.stdout ?
            }

            if (logInFile) {
                //save object
            }

            this.Original.oldLog(log);
        };


    };

    
    Console2.prototype.Original = consoleOriginal;


    //inherits form EventEmitter.prototype
    util.inherits(Console2, EventEmitter);


    module.exports = Console2;

}());
