(function () {

    'use strict';

    window.app.controller('folderController', [
        '$scope',
        '$rootScope',
        'logs',
        'folder',
        function ($scope, $rootScope, logs, folder) {
            
            $rootScope.sidebar = false;
            $scope.onlyFiles = true;

            $scope.blocks = folder.map(function (item) {
            
                if (item.type !== 'file') {
                    $scope.onlyFiles = false;
                }

                return {
                    message : item.name,
                    click   : function () {
                        if (item.type === 'file') {
                            
                            //Save all current files
                            //But select only the clicked one
                            var newFiles = folder.map(function (file) {
                                if (file.type === 'file') {
                                    return {
                                        selected : file.path === item.path,
                                        name     : file.name,
                                        path     : file.path
                                    };
                                } else {
                                    return null;
                                }
                            });

                            logs.setLogs(newFiles);
                            $rootScope.go('logs');

                        } else {
                            $rootScope.go('folder', {
                                path : item.path
                            });
                        }
                    }
                };
            });
        }
    ]);

}());
