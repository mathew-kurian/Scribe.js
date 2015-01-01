/* jshint -W098 */
(function() {

    'use strict';

    var express = require('express'),
        path = require('path'),
        fs = require('fs');

    /**
     * map
     *
     * Custom map function
     * That filter undefined and null values
     *
     * @param  {Array}    arr
     * @param  {Function} callback
     * @return {Array}
     */
    var map = function(arr, callback) {

        var result = arr.map(callback);

        return result.filter(function(item) {
            return item !== undefined && item !== null;
        });
    };

    /**
     * initWebPanel
     *
     * @param  {Array}          consoles    Array of Console2 instances with their logWriter
                                            [{
                                                console : Console2 instance,
                                                logWriter : null | LogWriter instance
                                            }]
     *
     * @return {Express Router}
     */
    var initWebPanel = function(consoles) {

        var webPanel = express.Router();

        //Static files

        webPanel.use('/', express.static(path.join(__dirname, '..', 'static')));

        //API

        /**
         * readDir
         *
         * Return dir content
         *
         * @param {String}      dirPath     A path
         * @param {Function}    callback    Function to chain with result array
         */
        var readDir = function(dirPath, callback) {

            if (!dirPath || typeof dirPath !== 'string') {
                callback("dirPath must be a string");
            } else {
                fs.readdir(dirPath, function(err, list) {
                    var dir = [];

                    if (err) {
                        callback(err, null);
                    } else {
                        list.forEach(function(item) {
                            dir.push(readNode(path.join(dirPath, item)));
                        });

                        callback(null, dir);
                    }

                });
            }

        };

        /**
         * readNode
         *
         * Return some infos on the file or folder given
         *
         * @param  {String} itemPath    A path
         * @return {Object}
         * @return {String} type        'folder' or 'file'
         * @return {String} name
         * @return {String} path        @see params
         */
        var readNode = function(itemPath) {

            var info = fs.statSync(itemPath),
                item = {};

            item.type = info.isDirectory() ? 'folder' : 'file';
            item.name = path.basename(itemPath);
            item.path = itemPath;

            return item;
        };

        /**
         * getLogFolders
         *
         * @return {Array}  logs folder in use
         */
        var getLogFolders = function() {

            return map(consoles, function(elem) {
                return elem.logWriter.rootPath || undefined;
            });
        };

        /**
         * getLogWriter
         *
         * @param {String}  logFolder   root folder of the logWriter to find
         *
         * @return {LogWriter|false}    If false, no logWriter with rootPath set to logFolder
         */
        var getLogWriter = function(logFolder) {

            var logWriter;

            return consoles.some(function(item) {
                if (item.logWriter && item.logWriter.rootPath === logFolder) {
                    logWriter = item.logWriter;
                    return true;
                }
            }) ? logWriter : false;

        };


        /**
         * /api
         *
         * Send logWriters
         */
        webPanel.get('/api', function(req, res) {

            var path = req.query.path;

            res.status(200).json(getLogFolders());
        });

        /**
         * /api/folderExplorer
         *
         * Send path content info
         */
        webPanel.get('/api/folderExplorer', function(req, res) {

            var path = req.query.path;

            readDir(path, function(err, dir) {
                if (err) {
                    res.status(400).end();
                } else {
                    res.status(200).json(dir);
                }
            });
        });

        /**
         * /api/dateExplorer
         *
         * Send files according to history dates
         * With pagination
         */
        webPanel.get('/api/dateExplorer', function(req, res) {

            var from = req.query.from || Date.now(),
                length = req.query.length || 10,
                logFolder = req.query.logFolder;

            var logWriter = getLogWriter(logFolder);

            if (!logWriter) {
                res.status(400).send('No logWriter attached to ' + logFolder);
            } else {

                var logWriterDates = Object.keys(logWriter.history.dates).sort();

                //Find the good dates
                var nb = 0,
                    result = [],
                    dates = logWriterDates.reverse().filter(function(date) {
                        if (date < from && nb <= length) {
                            nb++;
                            return date;
                        } else {
                            return null;
                        }
                    });

                dates.forEach(function(date) {
                    result.push({
                        date: date,
                        files: map(logWriter.history.dates[date], function(item) {
                            return {
                                name: path.basename(item),
                                path: item
                            };
                        })
                    });
                });

                res.status(200).json(result);
            }
        });

        /**
         * /api/log
         *
         * Send stream of file content
         */
        webPanel.get('/api/log', function(req, res) {

            var path = req.query.path;

            if (fs.existsSync(path)) {
                var stream = fs.createReadStream(path);

                res.writeHead(200, {
                    'Content-Length': fs.statSync(path).size,
                    'Content-Type': 'text/plain'
                });

                res.status(200);
                stream.pipe(res);
            } else {
                res.status(400).send("Can't read path");
            }
        });


        /**
         * /api/timezone
         *
         * Send the server timezone offset
         */
        webPanel.get('/api/timezoneOffset', function (req, res) {

            res.status(200).json({
                timezoneOffset : (new Date()).getTimezoneOffset()
            });

        });

        return webPanel;

    };

    module.exports = initWebPanel;

}());
