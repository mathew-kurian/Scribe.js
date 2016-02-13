'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ExpressInspector = function () {
  function ExpressInspector() {
    var colors = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];
    var symbols = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
    (0, _classCallCheck3.default)(this, ExpressInspector);

    this.colors = colors;
    this.symbols = symbols;
  }

  (0, _createClass3.default)(ExpressInspector, [{
    key: 'status',
    value: function status(express) {
      var stat = express.status;
      var symbol = '✓';
      var color = '';

      if (100 <= stat && stat < 200) {
        symbol = '';
      } else if (200 <= stat && stat < 300) {
        symbol = '✓';
      } else if (300 <= stat && stat < 400) {
        symbol = '';
      } else if (400 <= stat && stat < 500) {
        symbol = '✘';
        color = 'red';
      } else {
        symbol = '';
      }

      var ret = undefined;
      if (this.symbols) {
        ret = symbol + ' ' + stat;
      } else {
        ret = '' + stat;
      }

      return color ? _chalk2.default[color](ret) : ret;
    }
  }, {
    key: 'through',
    value: function through(data, callback) {
      var express = data.args[0];

      data.transient['callsite'] = '' + express.ip;
      data.args = [_chalk2.default.bgGreen.black(' ' + express.method + ' ') + ' ' + _chalk2.default.gray(express.url) + ' ' + this.status(express) + ' - ' + express.contentLength + ' ' + _chalk2.default.gray('(' + express.duration.toFixed(3) + 'ms)')];

      callback(null, data);
    }
  }]);
  return ExpressInspector;
}();

exports.default = ExpressInspector;
