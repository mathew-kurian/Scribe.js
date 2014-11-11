(function () {

    'use strict';

    window.app.directive('sidebarLoggers', [function () {
    
        return {
            scop        : false,
            restrict    : 'E',
            templateUrl : 'partials/elements/sidebarLoggers.html',
            replace     : true
        };
        
    }]); 

}());
