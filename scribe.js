/*jshint -W020 */

(function () {

    'use strict';

    var Console2      = require('./lib/console2.js'),
        LogWriter     = require('./lib/logWriter.js').LogWriter,
        ExpressLogger = require('./lib/expressLogger.js'),
        webPanel      = require('./lib/webPanel.js');


    /**
     * scribe
     *
     * Scribe.js module
     *
     * @param {Object}       scribeOpt                        Optional options
     * @param {String}       scribe.rootPath                  Logs folder. Default 'logs'
     * @param {Boolean}      scribeOpt.createDefaultConsole   Should scribe attach a fresh Console2
     *                                                        to process.console ? Default true.
     *
     * @return {Object}
     * @return {Function}    console                          Get a console
     * @return {Function}    webPanel                         Get an express Router
     * @return {Constructor} Console2                         Console2 constructor
     * @return {Constructor} LogWriter                        LogWriter constructor
     * @return {Object}      express                          Express utils
     */
    var scribe = function (scribeOpt) {

        //Scribe options

        if (!scribeOpt) {
            scribeOpt = {};
        }

        scribeOpt.rootPath             = scribeOpt.rootPath || 'logs';
        scribeOpt.createDefaultConsole = scribeOpt.createDefaultConsole !== false;


        /**
         * consoles
         *
         * Stores consoles and their logWriters
         *
         * @type {Array}
         */
        var consoles = [];


        /**
         * listenOnConsole
         *
         * Listen on console2 events 'new' and 'newLogger'
         * Save logs and options.
         *
         * @param {Console2}    console2    A Console2 instance
         * @param {LogWriter}   logWriter   A LogWriter instance
         */
        var listenOnConsole = function (console2, logWriter) {

            //On new log, save it
            console2.on('new', function (log) {

                logWriter.save(log, {
                    logger   : log.opt
                });

            });

            //On new logger, save its options
            console2.on('newLogger', function (logger, loggerOpt) {

                logWriter.addLogger(loggerOpt);

            });
        };


        /**
         * createBasic
         *
         * Create basic log function of nodejs for `console`
         *
         * @param {Console2}    console
         */
        var createBasic = function (console) {

            var loggers = [
                {
                    name  : 'log',
                    color : 'white'
                },
                {
                    name  : 'info',
                    color : 'cyan'
                },
                {
                    name  : 'error',
                    color : 'red'
                },
                {
                    name  : 'warning',
                    color : 'yellow'
                },
                {
                    name  : 'dir',
                    color : 'white'
                }
            ];

            loggers.forEach(function (logger) {
                console.addLogger(logger.name, logger.color);
            });
        };


        /**
         * addConsole
         *
         * Create a new console
         *
         * @param {Object}       config                 Config options
         * @param {?Object}      config.console         Console2 options
         * @param {?Object}      config.logWriter       LogWriter options.
         *                                              If false, Scribe won't save logs on disk.
         * @param {Boolean}      config.createBasic     Should scribe create basic logging functions ?
         *                                              Default true
         *
         * @param {LogWriter}    logWriter              Optional. A custom logWriter instance
         *
         * @return {Console2}                           A new Console2 instance
         */
        var addConsole = function (config, logWriter) {

            if (!config) {
                config = {};
            }

            config.createBasic = config.createBasic !== false;

            var console = new Console2(config.console || {});

            if (config.logWriter !== false) { //if config.logWriter is false, don't save logs

                if (!logWriter) {

                    var rootPath = config.logWriter ?
                        config.logWriter.rootPath || scribeOpt.rootPath :
                        scribeOpt.rootPath
                    ;

                    logWriter = new LogWriter(rootPath);
                }

                listenOnConsole(
                    console,
                    logWriter
                );
            }

            consoles.push({
                console   : console,
                logWriter : config.logWriter !== false ? logWriter : null
            });

            //Create basic logging functions
            if (config.createBasic) {
                createBasic(console);
            }

            return console;
        };



        /**
         * initWebPanel
         *
         * @return  an express Router
         */
        var initWebPanel = function () {

            return webPanel(consoles);

        };


        //Create a default console2 and attach it to process
        if (scribeOpt.createDefaultConsole) {
            process.console = addConsole();
        }



        return  {

            /**
             * console
             *
             * @type {Function}
             */
            console : addConsole,

            /**
             * webPanel
             *
             * @type {Function}
             */
            webPanel : initWebPanel,

            /**
             * express
             *
             * Utilities for express
             * @type {Object}
             */
            express  : ExpressLogger,

            /**
             * Console2
             *
             * @constructor
             */
            Console2 : Console2,

            /**
             * LogWriter
             *
             * @constructor
             */
            LogWriter : LogWriter
        };
    };

    module.exports = scribe;

}());
