/* jshint -W098 */
(function () {

    'use strict';

    var moment = require('moment'),
        fs     = require('fs'),
        mkdirp = require('mkdirp'),
        path   = require('path');

    /**
     * createDir
     *
     * Create a dir if it doesn't exist yet
     *
     * @param {String}   path     The dir
     * @param {Function} callback
     */
    var createDir = function (path, callback) {
        mkdirp(path, function (err) {
            callback(err);
        });
    };

    /**
     * appendFile
     *
     * Append content to a file
     *
     * @param {String}   pathToFile  The file
     * @param {String}   content
     * @param {Function} callback
     */
    var appendFile = function (pathToFile, content, callback) {
        createDir(path.dirname(pathToFile), function (err) {
            if (err) {
                callback(err);
            } else {
                fs.appendFile(pathToFile, content, callback);
            }
        });
    };

    /**
     * writeFile
     *
     * Write content into a file (erase old one)
     *
     * @param {String}   pathToFile  The file
     * @param {String}   content
     * @param {Function} callback
     */
    var writeFile = function (pathToFile, content, callback) {
        createDir(path.dirname(pathToFile), function (err) {
            if (err) {
                callback(err);
            } else {
                fs.writeFile(pathToFile, content, callback);
            }
        });
    };


    /**
     * LogWriter
     *
     * Save console logs on disk
     * 
     * @constructor
     *
     * @param {Console2} cons           A Console2 instance
     * @param {Object}   opt            Logger's options
     * @param {String}   opt.rootPath   Logs folder. Default 'logs'.
     * @param {Boolean}  opt.start      Whether to start to log right now or not. Default true.
     *                                  Use false when you want to custom getPath, getFilename, etc.
     */
    var LogWriter = function () {};

    /**
     * LogWriter.prototype.getPath
     *
     * @param {Object}  opt         params
     * @param {Object}  opt.logger  The logger
     *
     * @return {String}             The path to current folder (without rootPath)
     */
    LogWriter.prototype.getPath = function (opt) {
    
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
     * @param {Object}  opt.logger  The logger
     *
     * @return {String}             the filname (with extension)
     */
    LogWriter.prototype.getFile = function (opt) {
    
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
     * @param {Object}  opt.logger  The logger
     *
     * @return {String}             the full path to file
     */
    LogWriter.prototype.path = function (opt) {
        return path.join(
                opt.rootPath,
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
     * @param {Object}  opti            Options
     * @param {String}  opt.rootPath    root logs folder
     */
    LogWriter.prototype.save = function (log, opt) {
    
        delete log.opt; //we save logger options in rootPath/[logger].json 

        var json = JSON.stringify(log);

        appendFile(this.path(opt), json + '\n', function (err) {
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
     * @param {Object}  opt             LogWriter options
     * @param {String}  opt.rootPath    Logs folder
     */
    LogWriter.prototype.saveOpt = function (logger, opt) {

        var filePath = path.join(opt.rootPath, logger.name + '.json');

        writeFile(filePath, JSON.stringify(logger), function (err) {
            if (err) {
                throw err;
            }
        });

    };
    
    module.exports = LogWriter;


}());
