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
    var LogWriter = function (rootPath) {
    
        this.rootPath = rootPath || 'logs';

        //Check if the folder is already in use
        if (rootPaths.indexOf(this.rootPath) > -1) {
            throw new Error('Folder ' + this.rootPath + ' already in use');
        } else {
            rootPaths.push(this.rootPath);
        }
    };

    /**
     * LogWriter.prototype.getUser
     *
     * Tool, return active user
     *
     * @return {String}
     */
    LogWriter.prototype.getUser = function () {

        var user = '';

        try {

            var platformKey     = process.platform === 'win32' ? 'USERPROFILE' : 'HOME',
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
     * @param {String}  opt.logger  logger options
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
     * @param {String}  opt.logger  logger options
     *
     * @return {String}             the full path to file
     */
    LogWriter.prototype.path = function (opt) {
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
     */
    LogWriter.prototype.saveOpt = function (logger) {

        var filePath = path.join(this.rootPath, logger.name + '.json');

        writeFile(filePath, JSON.stringify(logger), function (err) {
            if (err) {
                throw err;
            }
        });

    };

    /**
     * LogWriter.prototype.addLoger
     *
     * Simply call this.saveOpt() from now
     * but could be use for more
     *
     * @param {Object}  logger  Console2 logger options
     */
    LogWriter.prototype.addLogger = function (logger) {

        this.saveOpt(logger);
    };
    

    module.exports = {
        LogWriter : LogWriter,
        folders   : rootPaths
    };

}());
