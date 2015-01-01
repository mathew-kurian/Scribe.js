(function () {

    'use strict';

    /**
     * Home controller
     */

    window.app.controller('homeController', [
        '$scope',
        '$rootScope',
        function ($scope, $rootScope) {

            //reset
            $rootScope.title = "Loggers";
            $rootScope.sidebar = false;

            //build block for each logWriter
            $scope.blocks = $rootScope.logWriters.map(function (item) {

                return {
                    message : item,
                    click   : function () {
                        $rootScope.go(
                            $rootScope.mode, //routes according to mode
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
