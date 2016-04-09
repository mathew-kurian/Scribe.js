'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _onFinished = require('on-finished');

var _onFinished2 = _interopRequireDefault(_onFinished);

var _time = require('../libs/time');

var _time2 = _interopRequireDefault(_time);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ExpressLogger = function () {
  function ExpressLogger(scribe) {
    (0, _classCallCheck3.default)(this, ExpressLogger);

    this.options = scribe.module('middleware/ExpressLogger').options;
    this.scribe = scribe;
  }

  (0, _createClass3.default)(ExpressLogger, [{
    key: 'getMiddleware',
    value: function getMiddleware() {
      var scribe = this.scribe;
      var options = this.options;


      return function (req, res, next) {
        var start = (0, _time2.default)();
        (0, _onFinished2.default)(res, function () {
          var originalUrl = req.originalUrl;
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = (0, _getIterator3.default)(options.ignore), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var k = _step.value;

              if (new RegExp(k).test(originalUrl)) {
                return;
              }
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }

          scribe[options.expose]({ req: req, res: res, duration: (0, _time2.default)() - start });
        });

        next();
      };
    }
  }]);
  return ExpressLogger;
}();

exports.default = ExpressLogger;
