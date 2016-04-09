'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _Console2 = require('./Console');

var _Console3 = _interopRequireDefault(_Console2);

var _callsite = require('callsite');

var _callsite2 = _interopRequireDefault(_callsite);

var _time2 = require('../libs/time');

var _time3 = _interopRequireDefault(_time2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var basicConsole = function (_Console) {
  (0, _inherits3.default)(basicConsole, _Console);

  function basicConsole(app, id) {
    (0, _classCallCheck3.default)(this, basicConsole);

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(basicConsole).call(this, app, id));

    _this._times = new _map2.default();

    // open loggers

    _this.expose('trace');
    _this.expose('log');
    _this.expose('warn');
    _this.expose('error');
    _this.expose('info');
    _this.expose('timing');
    return _this;
  }

  (0, _createClass3.default)(basicConsole, [{
    key: 'date',
    value: function date() {
      this.transient('date', new Date());
    }
  }, {
    key: 'time',
    value: function time(label) {
      this._times.set(label, (0, _time3.default)());

      return this;
    }
  }, {
    key: 'tag',
    value: function tag() {
      for (var _len = arguments.length, tags = Array(_len), _key = 0; _key < _len; _key++) {
        tags[_key] = arguments[_key];
      }

      this.transient('tags', tags);

      return this;
    }
  }, {
    key: 'metric',
    value: function metric() {
      var map = {};

      for (var _len2 = arguments.length, metrics = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        metrics[_key2] = arguments[_key2];
      }

      for (var i = 1; i < metrics.length; i += 2) {
        map[metrics[i - 1]] = metrics[i];
      }

      this.transient('metrics', (0, _assign2.default)(this.transient('metrics') || {}, map));

      return this;
    }
  }, {
    key: 'trace',
    value: function trace(text) {
      this.transient('callsite', this.callSite(2));
      return this.out('trace', new Error(text));
    }
  }, {
    key: 'timeEnd',
    value: function timeEnd(label) {
      var start = this._times.get(label);
      if (!start) {
        throw new Error('No such label: ' + label);
      }

      this.captureStackTrace();

      this._times.delete(label);

      var duration = (0, _time3.default)() - start;

      return this.metric(label, duration).timing('');
    }
  }]);
  return basicConsole;
}(_Console3.default);

exports.default = basicConsole;
