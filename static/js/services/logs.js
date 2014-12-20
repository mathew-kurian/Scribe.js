(function () {

    'use strict';

    /**
     * Logs service
     *
     * A bridge between dates or folder controller and logs controller
     *
     * Stores files to show in logs viewer
     */

    window.app.factory('logs', [function () {
        
        /**
         * files
         *
         * @type {Array}    Array of object
         *
            {
                name : 'file name',
                path : 'file full path (with logWriter dir)',
                selected : True     //if false, file belongs to currentFiles 
                                    //but won't be show by default in the log viewer
            }
         *
         */
        var files = [];

        /**
         * basename
         *
         * @see http://stackoverflow.com/questions/3820381/need-a-basename-function-in-javascript#comment29942319_15270931
         *
         * @param {String} path
         */
        var basename = function (path) {
            return path.split(/[\\/]/).pop();
        };

        /**
         * pathInFiles
         *
         * Is the path `search` in `files` ?
         *
         * @param {String} search
         */
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

            /**
             * getLogs
             *
             * @return      all files
             */
            getLogs : function () {
                return files;
            },
            
            /**
             * addLog
             *
             * Add a log file
             *
             * @param {String}  path        The path's file
             * @param {Boolean} selected    Whether the file is selected. Default false.
             *
             * @return      all files 
             */
            addLog : function (path, selected) {

                if (!pathInFiles(path)) {
                    var file;

                    //if path is string, we constructthe good object
                    if (typeof path === 'string') {
                        file = {
                            name : basename(path),
                            path : path,
                            selected : selected || false
                        };
                    } else {
                        //TODO : check something ?
                        file = path;
                    }

                    files.push(file);
                }
                return files;
            },

            /**
             * setLogs
             *
             * Override `files`
             *
             * @param {Array} newFiles
             */
            setLogs : function (newFiles) {
                //simply delete null and undefined values that can comes from map()
                files = newFiles.filter(function (item) {
                    return !!item; 
                });
            }

        };
        
    }]);

}());
