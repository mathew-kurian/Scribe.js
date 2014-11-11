(function () {

    'use strict';

    window.app.controller('dateController', [
        '$scope',
        '$rootScope',
        '$filter',
        'logs',
        'dates',
        function ($scope, $rootScope, $filter, logs, dates) {

            $rootScope.sidebar = false;

            $scope.blocks = dates.map(function (item) {
                
                return {
                    type          : 'date',
                    messageTop    : $filter('date')(item.date, 'MMM'),
                    message       : $filter('date')(item.date, 'd'),
                    messageBottom : $filter('date')(item.date, 'yyyy'),
                    click : function () {
                        logs.setLogs(item.files.map(function (el, index) {
                            return {
                                selected : index === 0, //select the first by default 
                                name     : el.name,
                                path     : el.path
                            };
                        }));
                        $rootScope.go('logs');
                    }
                };
                
            });
        }
    ]);

}());
