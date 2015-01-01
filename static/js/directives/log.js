(function () {

    'use strict';

    /**
     * Log directive
     *
     * Represents a single log
     */

    window.app.directive('log', [function () {

        return {
            scope : {

                /**
                 * log
                 *
                 * The log object
                 * @type {Object}
                 */
                log      : "=",

                /**
                 * number
                 *
                 * Line number
                 * @type {Int}
                 */
                number : "=",

                /**
                 * showFile
                 *
                 * Force to show file ?
                 *
                 * @type {Boolean}
                 */
                showFile : "=",

                /**
                 * showTime
                 *
                 * Force to show time ?
                 *
                 * @type {Boolean}
                 */
                showTime : "=",

                /**
                 * showDate
                 *
                 * Force to show date ?
                 *
                 * @type {Boolean}
                 */
                showDate : "=",

                /**
                 * showTags
                 *
                 * Force to show tags ?
                 *
                 * @type {Boolean}
                 */
                showTags : "="
            },
            restrict    : 'E',
            templateUrl : 'partials/elements/log.html',
            replace     : true,

            controller : ['$rootScope', '$scope', function ($rootScope, $scope) {

                $scope.timezoneDate = $rootScope.timezoneDate;

                /**
                 * $scope.handleTags
                 *
                 * As tags could be string or object,
                 * extracts the tag message
                 *
                 * @type {Function}
                 */
                $scope.handleTags = function (tag) {

                    if (typeof tag === 'string') {
                        return tag;
                    } else if (typeof tag === 'object') {
                        return tag.msg || '';
                    } else {
                        return tag;
                    }

                };

                /**
                 * scope.collapse
                 *
                 * @type {Boolean}  True to collapse the log
                 */
                $scope.collapse = false;

                /**
                 * $scope.changeState
                 */
                $scope.changeState = function () {
                    $scope.collapse = !$scope.collapse;
                };

                /**
                 * $scope.isMultilines
                 *
                 * @return {Boolean}        true if log is multilines
                 */
                $scope.isMultilines = function () {
                    if ($scope.log.hasOwnProperty('argsString')) {
                        return (/\n/).test($scope.log.argsString);
                    } else {
                        return (/\n/).test($scope.log);
                    }
                };

            }]
        };

    }]);


}());
