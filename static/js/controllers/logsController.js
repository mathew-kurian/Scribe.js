(function () {

    'use strict';

    /**
     * Logs controller
     */

    window.app.controller('logsController', [
        '$scope',
        '$rootScope',
        'ScribeAPI',
        'logs',
        function ($scope, $rootScope, ScribeAPI, logs) {

            //reset
            $rootScope.sidebar = false;

            /**
             * attachCurrentFiles
             *
             * Attach current files to $scope
             * If no current files, redirect to home
             *
             * @type {Function}
             */
            var attachCurrentFiles = function (currentFiles) {
                //if no files, redirect to home
                if (currentFiles.length === 0) {
                    $rootScope.go('/');
                }
                $scope.currentFiles = currentFiles;
            };

            /**
             * getCurrentLogs
             *
             * Get content of each current files
             * And push all the lines in `$scope.lines`
             *
             * @type {Function}
             */
            var getCurrentLogs = function () {

                $scope.currentFiles.forEach(function (file) {

                    if (file.selected) {
                        ScribeAPI.log({
                            path : file.path
                        }, function (data) {
                            if (!Array.isArray($scope.lines)) {
                                $scope.lines = [];
                            }
                            $scope.lines = $scope.lines.concat(data);
                        });
                    }

                });
            };

            /**
             * selectAll
             *
             * Select all current files
             *
             * @params {Boolean} select     True: select / False: unselect
             * @type   {Function}
             */
            var selectAll = function (select) {
                $scope.currentFiles = $scope.currentFiles.map(function (file) {
                    file.selected = select;
                    return file;
                });
            };


            /**
             * Init $sope values
             */

            //ng-toggle values
            //3 states : 1 / null / 0
            $scope.showFile = 0;
            $scope.showTime = 0;
            $scope.showDate = 1;
            $scope.showTags = 1;

            //Stores all lines (a line = a log)
            $scope.lines = false;

            //default order by time
            $scope.order   = "context.time";
            //order reverse
            $scope.reverse = true;

            /**
             * $scope.addFile
             *
             * Add a file to current files
             *
             * @param {String} path     Its path (with logWriter dir)
             * @type  {Function}
             */
            $scope.addFile = function (path) {
                if (path !== "") {
                    attachCurrentFiles(logs.addLog(path, true));
                }
                $scope.fileToAdd = "";
            };

            /**
             * $scope.reload
             *
             * Reload all selected files
             * @type {Function}
             */
            $scope.reload = function () {
                $scope.lines = false;
                attachCurrentFiles(logs.getLogs());
                getCurrentLogs();
            };

            $scope.reload();


            /**
             * Watchers
             */

            //watch current files for changes
            //as user can select / unselect files in sidebar
            $scope.$watch('currentFiles', function (value, old) {
                $scope.lines = false;
                if (value !== old) {
                    getCurrentLogs();
                }
            }, true);

            //watch selectAll checkbox
            //to select all current files
            $scope.$watch('selectAll', function (value, old) {
                if (value !== old) {
                    selectAll(value);
                }
            });

        }
    ]);

}());
