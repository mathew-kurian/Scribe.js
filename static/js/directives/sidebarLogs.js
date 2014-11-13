(function () {

    'use strict';

    /**
     * Log viewer sidebar directives
     */

    window.app.directive('sidebarLogs', [function () {
    
        return {
            scope       : false,
            restrict    : 'E',
            templateUrl : 'partials/elements/sidebarLogs.html',
            replace     : true
        };
        
    }]); 

}());
