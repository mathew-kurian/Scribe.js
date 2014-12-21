/* jshint -W098 */
(function() {

    'use strict';

    var moment = require('moment'),
        fs = require('fs'),
        mkdirp = require('mkdirp'),
        path = require('path');


    /**
     * rootPaths
     *
     * Store all rootPaths
     * @type {Array}
     */
    var rootPaths = [];


    /**
     * LogWriter
     *
     * Save console logs on disk
     *
     * @constructor
     *
     * @param {String}  rootPath    root logs folder
     */
    var LogWriter = function(rootPath) {

        this.rootPath = rootPath || 'logs';

        //Check if the folder is already in use
        if (rootPaths.indexOf(this.rootPath) > -1) {
            throw new Error('Folder ' + this.rootPath + ' already in use');
        } else {
            rootPaths.push(this.rootPath);
        }

        //Init history
        this.initHistory();
    };

    /**
     * LogWriter.prototype.initHistory
     *
     * Attach and init the history property
     */
    LogWriter.prototype.initHistory = function() {

        this.history = {
            dates: {}
        };

        var historyPath = path.join(this.rootPath, 'history.json');

        if (!fs.existsSync(historyPath)) { //create file if doesn't exist yet

            this.writeFile(
                historyPath,
                this.history,
                function(err) {
                    if (err) {
                        throw err;
                    }
                }
            );

        } else { //get history if file exists

            var self = this;

            fs.readFile(historyPath, {
                "encoding" : "utf-8"
            }, function(err, data) {
                if (err) {
                    throw err;
                } else {
                    try {
                        self.history = JSON.parse(data);
                    } catch (e) {
                        throw e;
                    }
                }
            });
        }
    };

    /**
     * LogWriter.prototype.createDir
     *
     * Create a dir if it doesn't exist yet
     *
     * @param {String}   path     The dir
     * @param {Function} callback
     */
    LogWriter.prototype.createDir = function(path, callback) {

        mkdirp(path, function(err) {
            callback(err);
        });
    };

    /**
     * LogWriter.prototype.appendFile
     *
     * Append content to a file
     *
     * @param {String}   pathToFile  The file
     * @param {String}   content
     * @param {Function} callback
     */
    LogWriter.prototype.appendFile = function(pathToFile, content, callback) {

        var self = this;

        self.createDir(path.dirname(pathToFile), function(err) {

            if (err) {
                callback(err);
            } else {

                var newFile = !fs.existsSync(pathToFile);

                fs.appendFile(pathToFile, content, function(err) {

                    if (err) {
                        throw err;
                    } else if (newFile) {
                        self.newFileHistory(pathToFile);
                        callback();
                    }

                });
            }
        });
    };

    /**
     * LogWriter.prototype.writeFile
     *
     * Write content into a file (erase old one)
     *
     * @param {String}   pathToFile  The file
     * @param {String}   content
     * @param {Function} callback
     */
    LogWriter.prototype.writeFile = function(pathToFile, content, callback) {

        if (typeof content !== 'string') {
            content = JSON.stringify(content);
        }

        this.createDir(path.dirname(pathToFile), function(err) {
            if (err) {
                callback(err);
            } else {
                fs.writeFile(pathToFile, content, {
                    "encoding" : "utf-8"
                }, callback);
            }
        });
    };

    /**
     * LogWriter.prototype.newFileHistory
     *
     * Save the new file path in history according to the date
     *
     * @param {String}  pathToFile
     */
    LogWriter.prototype.newFileHistory = function(pathToFile) {

        var historyPath = path.join(this.rootPath, 'history.json'),
            self = this;

        var today = moment().startOf('day').valueOf().toString();

        //Save the path under today key

        if (!self.history.dates[today]) {
            self.history.dates[today] = [];
        }

        if (self.history.dates[today].indexOf(pathToFile) === -1) {

            self.history.dates[today].push(pathToFile);

            self.writeFile(historyPath, self.history, function(err) {
                if (err) {
                    throw err;
                }
            });
        }

    };

    /**
     * LogWriter.prototype.getUser
     *
     * Tool, return active user
     *
     * @return {String}
     */
    LogWriter.prototype.getUser = function() {

        var user = '';

        try {

            var platformKey = process.platform === 'win32' ? 'USERPROFILE' : 'HOME',
                platformDivider = process.platform === 'win32' ? '\\' : '/';

            var userDir = process.env[platformKey].toLowerCase();
            user = userDir.slice(userDir.lastIndexOf(platformDivider) + 1);

        } catch (e) {
            user = 'user'; //default
        } finally {
            return user;
        }
    };

    /**
     * LogWriter.prototype.getPath
     *
     * @param {Object}  opt         params
     * @param {String}  opt.logger  logger options
     *
     * @return {String}             The path to current folder (without rootPath)
     */
    LogWriter.prototype.getPath = function(opt) {

        var now = moment();

        return path.join(
            now.format('YYYY'),
            now.format('MMM')
        );
    };

    /**
     * LogWriter.prototype.getFile
     *
     * @param {Object}  opt         params
     * @param {String}  opt.logger  logger options
     *
     * @return {String}             the filname (with extension)
     */
    LogWriter.prototype.getFile = function(opt) {

        var now = moment();

        return (now.format('DD_MMM_YY')).toLowerCase() +
            '.' +
            opt.logger.name +
            '.json';
    };

    /**
     * LogWriter.prototype.path
     *
     * @param {Object}  opt         params
     * @param {String}  opt.logger  logger options
     *
     * @return {String}             the full path to file
     */
    LogWriter.prototype.path = function(opt) {
        return path.join(
            this.rootPath,
            this.getPath(opt),
            this.getFile(opt)
        );
    };

    /**
     * LogWriter.prototype.save
     *
     * Save a log on disk
     *
     * @param {Object}  log             The log to save
     *
     * @param {Object}  opt             Options
     * @param {String}  opt.logger      logger options
     */
    LogWriter.prototype.save = function(log, opt) {

        try {
            delete log.opt; //we save logger options in rootPath/[logger].json
        } catch(e){
            // ignore
        }

        var json = JSON.stringify(log);

        this.appendFile(this.path(opt), json + '\n', function(err) {
            if (err) {
                throw err;
            }
        });
    };

    /**
     * LogWriter.prototype.saveOpt
     *
     * Save logger opt in root folder
     *
     * @param {Object}  logger          Logger options.
     */
    LogWriter.prototype.saveOpt = function(logger) {

        var filePath = path.join(this.rootPath, logger.name + '.json');

        this.writeFile(filePath, JSON.stringify(logger), function(err) {
            if (err) {
                throw err;
            }
        });
    };

    /**
     * LogWriter.prototype.addLogger
     *
     * Simply call this.saveOpt() from now
     * but could be use for more
     *
     * @param {Object}  logger  Console2 logger options
     */
    LogWriter.prototype.addLogger = function(logger) {
        this.saveOpt(logger);
    };


    module.exports = {
        LogWriter: LogWriter,
        folders: rootPaths
    };

}());
