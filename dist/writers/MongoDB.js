'use strict';

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _entry = require('../schemas/entry');

var _entry2 = _interopRequireDefault(_entry);

var _JSON = require('../libs/JSON2');

var JSON2 = _interopRequireWildcard(_JSON);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MongoDB = function () {
  function MongoDB() {
    var address = arguments.length <= 0 || arguments[0] === undefined ? 'mongodb://localhost/scribe' : arguments[0];
    var debug = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
    (0, _classCallCheck3.default)(this, MongoDB);

    _mongoose2.default.set('debug', debug);

    var conn = _mongoose2.default.createConnection(address);
    this._debug = debug;
    this._entry = conn.model('Entry', _entry2.default);
  }

  (0, _createClass3.default)(MongoDB, [{
    key: 'through',
    value: function through(data, callback) {
      var _this = this;

      new this.Entry(JSON.parse(JSON2.stringify(data))).save(function (err, data) {
        if (err && _this._debug) console.error(err);
        callback(err, data);
      });
    }
  }, {
    key: 'Entry',
    get: function get() {
      return this._entry;
    }
  }]);
  return MongoDB;
}();

exports.default = MongoDB;
