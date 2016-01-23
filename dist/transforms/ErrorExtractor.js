"use strict";

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ErrorExtractor = function () {
  function ErrorExtractor() {
    (0, _classCallCheck3.default)(this, ErrorExtractor);
  }

  (0, _createClass3.default)(ErrorExtractor, [{
    key: "through",
    value: function through(data, callback) {
      data.args = data.args.map(function (a) {
        return a instanceof Error ? JSON.parse((0, _stringify2.default)(a, ["message", "arguments", "type", "name", "stack"])) : a;
      });

      callback(null, data);
    }
  }]);
  return ErrorExtractor;
}();

exports.default = ErrorExtractor;
