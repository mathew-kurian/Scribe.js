(function () {

    'use strict';

    window.app.directive('sidebarLogs', [function () {
    
        return {
            scope       : false,
            restrict    : 'E',
            templateUrl : 'partials/elements/sidebarLogs.html',
            replace     : true
        };
        
    }]); 

}());
