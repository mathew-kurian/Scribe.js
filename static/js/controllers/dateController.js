(function () {

    'use strict';

    /**
     * Dates controller
     */

    window.app.controller('dateController', [
        '$scope',
        '$rootScope',
        '$filter',
        'logs',
        'dates',
        function ($scope, $rootScope, $filter, logs, dates) {

            //reset
            $rootScope.sidebar = false;

            //build blocks
            $scope.blocks = dates.map(function (item) {
                
                return {
                    type          : 'date',
                    messageTop    : $filter('date')(item.date, 'MMM'),
                    message       : $filter('date')(item.date, 'd'),
                    messageBottom : $filter('date')(item.date, 'yyyy'),
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
