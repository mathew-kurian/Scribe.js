'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _JSON = require('../libs/JSON2');

var JSON2 = _interopRequireWildcard(_JSON);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ToJSON2 = function () {
  function ToJSON2() {
    (0, _classCallCheck3.default)(this, ToJSON2);
  }

  (0, _createClass3.default)(ToJSON2, [{
    key: 'through',
    value: function through(data, callback) {
      callback(null, JSON.parse(JSON2.stringify(data)));
    }
  }]);
  return ToJSON2;
}();

exports.default = ToJSON2;
