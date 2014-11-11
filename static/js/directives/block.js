(function () {

    'use strict';
    
    window.app.directive('block', [function () {

        return {
            scope : {
                type          : "=",
                message       : "=",
                messageTop    : "=",
                messageBottom : "=",
                forceFile     : "="
            },
            restrict : "E",
            templateUrl : 'partials/elements/blocks.html',
            replace : true
        };

    }]);

}());
