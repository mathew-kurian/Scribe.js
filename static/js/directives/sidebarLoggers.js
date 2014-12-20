(function () {

    'use strict';

    /**
     * Home, folders and dates sidebar directives
     */

    window.app.directive('sidebarLoggers', [function () {
    
        return {
            scop        : false,
            restrict    : 'E',
            templateUrl : 'partials/elements/sidebarLoggers.html',
            replace     : true
        };
        
    }]); 

}());
