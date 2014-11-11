(function () {

    'use strict';

    window.app.factory('logs', [function () {
        
        var files = [];

        var basename = function (path) {
            return path.split(/[\\/]/).pop();
        };

        var pathInFiles  = function (search) {
            var result = false;

            files.forEach(function (elem) {
                if (elem.path === search) {
                    result = true;
                }
            });
            
            return result;
        };

        return {

            getLogs : function () {
                return files;
            },
            
            addLog : function (path, selected) {

                if (!pathInFiles(path)) {
                    var file;

                    if (typeof path === 'string') {
                        file = {
                            name : basename(path),
                            path : path,
                            selected : selected || false
                        };
                    } else {
                        file = path;
                    }

                    files.push(file);
                }
                return files;
            },

            setLogs : function (newFiles) {
                files = newFiles.filter(function (item) {
                    return !!item;
                });
            }

        };
        
    }]);

}());
