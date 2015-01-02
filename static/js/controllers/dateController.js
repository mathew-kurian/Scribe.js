(function () {

    'use strict';

    /**
     * Dates controller
     */

    window.app.controller('dateController', [
        '$scope',
        '$rootScope',
        '$location',
        '$filter',
        'logs',
        'dates',
        function ($scope, $rootScope, $location, $filter, logs, dates) {

            //reset
            $rootScope.sidebar = false;

            /**
             * $scope.nextPage
             *
             * Go to to a next page
             *
             * @param {int} next    if < 0, goes to older dates, if > 0 goes to newer dates
             */
            $scope.nextPage = function (next) {

                var currentDate = $location.search().from || Date.now(),
                    day         = 24 * 60 * 60 * 1000;

                $rootScope.go(
                    'dates',
                    {
                        path   : $location.search().path,
                        from   : next * day + parseInt(currentDate, 10),
                        length : 10
                    }
                );
            };

            //build blocks
            $scope.blocks = dates.map(function (item) {

                var itemDate = $rootScope.timezoneDate(item.date);

                return {
                    type          : 'date',
                    messageTop    : $filter('date')(itemDate, 'MMM'),
                    message       : $filter('date')(itemDate, 'd'),
                    messageBottom : $filter('date')(itemDate, 'yyyy'),
                    click : function () {
                        //save files
                        logs.setLogs(item.files.map(function (el, index) {
                            return {
                                selected : index === 0, //select the first by default
                                name     : el.name,
                                path     : el.path
                            };
                        }));

                        //redirect
                        $rootScope.go('logs');
                    }
                };

            });
        }
    ]);

}());
