(function () {

    'use strict';

    window.app.directive('menu', [function () {
        
        return {
            scope       : false,
            restrict    : 'E',
            templateUrl : 'partials/elements/menu.html',
            replace     : true
        };

    }]);

}());
