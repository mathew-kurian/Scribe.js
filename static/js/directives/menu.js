(function () {

    'use strict';

    /**
     * Menu directive
     *
     * Log viewer top control bar
     */
    
    window.app.directive('menu', [function () {
        
        return {
            scope       : false,
            restrict    : 'E',
            templateUrl : 'partials/elements/menu.html',
            replace     : true
        };

    }]);

}());
