(function () {

    'use strict';

    window.app = angular.module('scribe', ['ngRoute', 'ngResource', 'ngToggle', 'autocomplete']);

    app.config(['$routeProvider', function ($routeProvider) {

        $routeProvider

            .when('/', {
                templateUrl : 'partials/blocks.html',
                controller  : 'homeController'
            })

            .when('/dates/', {
                templateUrl : 'partials/blocks.html',
                controller  : 'dateController',

                resolve : {
                    dates : [
                        'ScribeAPI',
                        '$rootScope',
                        '$location',
                        function (ScribeAPI, $rootScope, $location) {

                            var from      = $location.search().from || Date.now(),
                                length    = $location.search().length || 10,
                                logWriter = $location.search().path;
                            
                            $rootScope.title = logWriter + ' dates';
                            
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
                templateUrl : 'partials/blocks.html',
                controller  : 'folderController',

                resolve : {
                    folder : [
                        'ScribeAPI',
                        '$rootScope',
                        '$location',
                        function (ScribeAPI, $rootScope, $location) {
                            
                            var path = $location.search().path;

                            $rootScope.title = path;

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
        'ScribeAPI',
        function ($rootScope, $location, $q, $window, ScribeAPI) {

            /**
             * getAllLogsFiles
             *
             * Retrieve all logs files of all loggers
             * All files path are stored in history's log
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

                    data.forEach(function (history) {
                        Object.keys(history[0].dates).forEach(function (date) {
                            files = files.concat(history[0].dates[date]);
                        });
                    });

                    //concat the file result in one array
                    deferred.resolve(files);
                });

                return deferred.promise;
            };

            $rootScope.mode = 'dates';

            $rootScope.title = "ScribeJS";

            $rootScope.sidebar = false;

            $rootScope.logWriters = [];
            $rootScope.allLogsFiles = [];

            ScribeAPI.logWriters(function (logWriters) {
                $rootScope.logWriters = logWriters;
                getAllLogsFiles(logWriters).then(function (files) {
                    $rootScope.allLogsFiles = files;
                });
            });

            $rootScope.back = function () {
                $window.history.back();
            };

            $rootScope.go = function (path, search) {
                $location.path(path);
                if (search) {
                    $location.search(search);
                } else {
                    $location.search({});
                }
            };

        }
    ]);

    

}());
