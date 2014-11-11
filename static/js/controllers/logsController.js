(function () {

    'use strict';

    window.app.controller('logsController', [
        '$scope',
        '$rootScope',
        'ScribeAPI',
        'logs',
        function ($scope, $rootScope, ScribeAPI, logs) {
            
            $rootScope.sidebar = false;

            var attachCurrentFiles = function (currentFiles) {
                //if no files, redirect to home
                if (currentFiles.length === 0) {
                    $rootScope.go('/');
                }
                $scope.currentFiles = currentFiles;
            };

            var getCurrentLogs = function () {

                $scope.currentFiles.forEach(function (file) {
                    
                    $scope.lines = [];

                    if (file.selected) {
                        ScribeAPI.log({
                            path : file.path
                        }, function (data) {
                            $scope.lines = $scope.lines.concat(data);
                        });
                    }

                });
            };

            var selectAll = function (select) {
                $scope.currentFiles = $scope.currentFiles.map(function (file) {
                    file.selected = select;
                    return file;
                });
            };


            /**
             * ng-toggle values
             * 3 states : 1 / null / 0
             */
            $scope.showFile = null;
            $scope.showTime = 1;
            $scope.showDate = 0;
            $scope.showTags = null;

            $scope.lines = [];

            $scope.order   = "context.time";
            $scope.reverse = false;

            $scope.addFile = function (path) {
                if (path !== "") {
                    attachCurrentFiles(logs.addLog(path, true));
                }
                $scope.fileToAdd = "";
            };

            $scope.reload = function () {
                attachCurrentFiles(logs.getLogs());
                getCurrentLogs();
            };
        
            $scope.reload();

            $scope.$watch('currentFiles', function (value, old) {
                if (value !== old) {
                    getCurrentLogs();
                }
            }, true);

            $scope.$watch('selectAll', function (value, old) {
                if (value !== old) {
                    selectAll(value);
                }
            });

        }
    ]);

}());
