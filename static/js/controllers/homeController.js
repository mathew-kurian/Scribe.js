(function () {

    'use strict';

    window.app.controller('homeController', [
        '$scope',
        '$rootScope',
        function ($scope, $rootScope) {

            $rootScope.title = "Loggers";
            $rootScope.sidebar = false;

            $scope.blocks = $rootScope.logWriters.map(function (item) {
                
                return {
                    message : item,
                    click   : function () {
                        $rootScope.go(
                            $rootScope.mode,
                            {
                                path : item
                            }
                        );
                    }
                };

            });
        }
    ]);

}());
