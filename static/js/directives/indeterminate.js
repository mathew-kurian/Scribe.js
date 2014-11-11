(function () {

    'use strict';

    window.app.directive('indeterminate', function () {

        return {
            restrict: 'A',
            link: [function (scope, element, attributes) {
                return scope.$watch(attributes.indeterminate, function (val) {
                    return element.prop('indeterminate', !!val);
               });
            }]
        };

    });

}());
