(function () {

    'use strict';

    /**
     * ScribeAPI
     *
     * A $resource API wrapper
     */

    window.app.factory('ScribeAPI', ['$resource', function ($resource) {

        return $resource(
            'api',
            null,
            {
                logWriters : {
                    method  : 'GET',
                    isArray : true
                },
                dateExplorer : {
                    method  : 'GET',
                    url     : 'api/dateExplorer',
                    isArray : true
                },
                folderExplorer : {
                    method  : 'GET',
                    url     : 'api/folderExplorer',
                    isArray : true
                },
                log : {
                    method       : 'GET',
                    url          : 'api/log',
                    isArray      : true,

                    //As logs are lines of JSON, we want to parse each lines one by one
                    transformResponse : function (data) {

                        var lines = data.match(/[^\r\n]+/g); //cut lines

                        return lines.map(function (line) {
                            try {
                                return JSON.parse(line);
                            } catch (e) {
                                return line;
                            }
                        });
                    }
                },
                timezoneOffset : {
                    methof : 'GET',
                    url    : 'api/timezoneOffset'
                }
            }
        );

    }]);

}());
