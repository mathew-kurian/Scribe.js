(function () {

    'use strict';

    /**
     * ScribeJS - WebPanel
     */

    window.app = angular.module('scribe', ['ngRoute', 'ngResource', 'ngToggle', 'autocomplete']);

    //Configure routes
    app.config(['$routeProvider', function ($routeProvider) {

        /**
         * Routes :
         *
         * - /
         *   Home page. Choose the good logger
         * - /dates/?path
         *   Choose the dates.
         * - /folder/?path
         *   Explore directories.
         * - /logs
         *   The logs viewer
         */

        $routeProvider

            .when('/', {
                templateUrl : 'partials/folder.html',
                controller  : 'homeController'
            })

            .when('/dates/', {
                templateUrl : 'partials/dates.html',
                controller  : 'dateController',

                // resolve dates
                resolve : {
                    dates : [
                        'ScribeAPI',
                        '$rootScope',
                        '$location',
                        function (ScribeAPI, $rootScope, $location) {

                            //query params
                            var from      = $location.search().from || Date.now(), //timestamp
                                length    = $location.search().length || 10,       //number of dates to show
                                logWriter = $location.search().path;               //which log writer to use ?

                            $rootScope.title = logWriter + ' dates';
                            $rootScope.path = logWriter + ' · dates';

                            //Get dates
                            return ScribeAPI.dateExplorer({
                                logFolder : logWriter,
                                from      : from,
                                length    : length
                            }).$promise;
                        }
                    ]
                }
            })

            .when('/folder/', {
                templateUrl : 'partials/folder.html',
                controller  : 'folderController',

                //resolve folder content
                resolve : {
                    folder : [
                        'ScribeAPI',
                        '$rootScope',
                        '$location',
                        function (ScribeAPI, $rootScope, $location) {

                            //folder path
                            var path = $location.search().path;

                            $rootScope.title = path;
                            $rootScope.path = path;

                            //Get folder content
                            return ScribeAPI.folderExplorer({
                                path : path
                            }).$promise;
                        }
                    ]
                }
            })

            .when('/logs/', {
                templateUrl : 'partials/logs.html',
                controller  : 'logsController'
            });
    }]);

    app.run([
        '$rootScope',
        '$location',
        '$q',
        '$window',
        '$document',
        'ScribeAPI',
        function ($rootScope, $location, $q, $window, $document, ScribeAPI) {

            $rootScope.$on('$routeChangeSuccess', function(ev,data) {
                if (data.$$route && data.$$route.controller){
                    $rootScope.controller = data.$$route.controller;
                }
            });

            /**
             * getAllLogsFiles
             *
             * Retrieve all logs files of all loggers
             * All files path are stored in the history file of each logger
             *
             * @param  {Array}  loggers
             * @return {promise}
             */
            var getAllLogsFiles = function (loggers) {

                var deferred       = $q.defer(),
                    loggersHistory = [];

                //First, get all history files
                loggers.forEach(function (logger) {
                    loggersHistory.push(ScribeAPI.log({
                        path: logger + '/history.json'
                    }).$promise);
                });

                //Then, extract all files path (they're saved by date)
                $q.all(loggersHistory).then(function (data) {

                    var files = [];

                    //extract the paths and push them in the `files` array
                    data.forEach(function (history) {
                        Object.keys(history[0].dates).forEach(function (date) {
                            files = files.concat(history[0].dates[date]);
                        });
                    });

                    //send the array
                    deferred.resolve(files);
                });

                return deferred.promise;
            };

            /**
             * $rootScope.mode
             *
             * Webpanel mode. Wether use folder or dates mode by default
             *
             * @type {String} 'folder' | 'dates'
             */
            $rootScope.mode = 'dates';

            /**
             * $rootScope.title
             *
             * Page title
             *
             * @type {String}
             */
            $rootScope.title = "ScribeJS";

            /**
             * $rootScope.sidebar
             *
             * Open/close sidebar
             *
             * @type {Boolean}
             */
            $rootScope.sidebar = false;

            /**
             * $rootScope.logWriters
             *
             * Stores all logsWriters of the app
             *
             * @type {Array}
             */
            $rootScope.logWriters = [];

            /**
             * $rootScope.allLogsFiles
             *
             * Stores all files of all logWriters
             *
             * @type {Array}
             */
            $rootScope.allLogsFiles = [];

            //Get all logWriters
            //Get all log files of atll logWriters
            ScribeAPI.logWriters(function (logWriters) {
                $rootScope.logWriters = logWriters;
                getAllLogsFiles(logWriters).then(function (files) {
                    $rootScope.allLogsFiles = files;
                });
            });

            /**
             * $rootScope.scribeTimezone
             *
             * Store the Scribe server timezoneOffset for showing good dates
             *
             * @type {Int}
             */
            $rootScope.scribeTimezone = 0;

            ScribeAPI.timezoneOffset(function (result) {
                $rootScope.scribeTimezone = result.timezoneOffset;
            });

            /**
             * timezoneDate
             *
             * Add/remove minutes to the timestamp according to
             * the timezone offset between server and browser time
             * Because angular date filter print date with the browser timezone
             *
             * @param  {Int|String}  timestamp
             * @return {Int}                    the new timestamp
             *
             * @type {Function}
             */
            $rootScope.timezoneDate = function (timestamp) {

                timestamp = Number(timestamp);

                var serverOffset = $rootScope.scribeTimezone;
                var localOffset  = (new Date()).getTimezoneOffset();

                var offset = serverOffset - localOffset;

                return timestamp - offset * 60 * 1000;
            };

            /**
             * $rootScope.back
             *
             * History back
             *
             * @type {Function}
             */
            $rootScope.back = function () {
                $window.history.back();
            };

            /**
             * $rootScope.go
             *
             * Wrapper for $location path and search
             *
             * @type {Function}
             */
            $rootScope.go = function (path, search) {
                $location.path(path);
                if (search) {
                    $location.search(search);
                } else {
                    $location.search({});
                }
            };

            $document.bind('keydown', function ($event) {
                if ($event.keyCode === 27) {
                    $rootScope.sidebar = false;
                    $rootScope.$digest();
                }
            });

        }
    ]);



}());
