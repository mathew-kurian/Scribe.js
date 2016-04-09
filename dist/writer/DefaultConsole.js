'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DefaultConsole = function () {
  function DefaultConsole() {
    (0, _classCallCheck3.default)(this, DefaultConsole);
  }

  (0, _createClass3.default)(DefaultConsole, [{
    key: 'through',
    value: function through(data, callback) {
      _underscore2.default.map(data.inspected, function (a) {
        return process.stdout.write(a + '\n');
      });
      callback();
    }
  }]);
  return DefaultConsole;
}();

exports.default = DefaultConsole;
