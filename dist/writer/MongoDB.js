'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EntrySchema = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _JSON = require('../libs/JSON2');

var JSON2 = _interopRequireWildcard(_JSON);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _jade = require('jade');

var _jade2 = _interopRequireDefault(_jade);

var _basicAuthConnect = require('basic-auth-connect');

var _basicAuthConnect2 = _interopRequireDefault(_basicAuthConnect);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _JSONStream = require('JSONStream');

var _JSONStream2 = _interopRequireDefault(_JSONStream);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var EntrySchema = exports.EntrySchema = new _mongoose.Schema({
  transient: _mongoose.Schema.Types.Object,
  persistent: _mongoose.Schema.Types.Object,
  args: _mongoose.Schema.Types.Object,
  date: { type: Date, default: Date.now },
  expose: String,
  serialized: String
});

EntrySchema.index({ 'persistent.app': 1, 'persistent.id': -1 });
EntrySchema.index({ 'serialized': 1, 'comment': 'text' });

var MongoDB = function () {
  function MongoDB(scribe) {
    (0, _classCallCheck3.default)(this, MongoDB);

    this.options = scribe.module('writer/MongoDB').options;

    var conn = _mongoose2.default.createConnection(this.options.uri);
    this._debug = this.options.debug;
    this._entry = conn.model('Entry', EntrySchema);
  }

  (0, _createClass3.default)(MongoDB, [{
    key: 'through',
    value: function through(data, callback) {
      var _this = this;

      new this.Entry(data).save(function (err, data) {
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
