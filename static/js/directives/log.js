(function () {

    'use strict';

    window.app.directive('log', [function () {
    
        return {
            scope : {
                log      : "=",
                showFile : "=",
                showTime : "=",
                showDate : "=",
                showTags : "="
            },
            restrict : 'E',
            templateUrl : 'partials/elements/log.html',
            replace : true,

            controller : ['$scope', function ($scope) {

                $scope.handleTags = function (tag) {

                    if (typeof tag === 'string') {
                        return tag;
                    } else if (typeof tag === 'object') {
                        return tag.msg || '';
                    } else {
                        return tag; //it will be convert to String by angular
                    }

                };

            }]
        };
        
    }]);


}());
