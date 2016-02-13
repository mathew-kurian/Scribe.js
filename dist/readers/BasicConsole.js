'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

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

var _onFinished = require('on-finished');

var _onFinished2 = _interopRequireDefault(_onFinished);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _time() {
  if (typeof process !== 'undefined' && typeof process.hrtime === 'function') {
    var duration = process.hrtime();
    return duration[0] * 1000 + duration[1] / 1e6;
  }

  return Date.now();
}

var _class = function (_Console) {
  (0, _inherits3.default)(_class, _Console);

  function _class(app, id) {
    (0, _classCallCheck3.default)(this, _class);

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(_class).call(this, app, id));

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

  (0, _createClass3.default)(_class, [{
    key: 'date',
    value: function date() {
      this.transient('date', new Date());
    }
  }, {
    key: 'time',
    value: function time(label) {
      this._times.set(label, _time());

      return this;
    }
  }, {
    key: 'middleware',
    value: function middleware() {
      var _this2 = this;

      var expose = arguments.length <= 0 || arguments[0] === undefined ? 'express' : arguments[0];
      var ignore = arguments.length <= 1 || arguments[1] === undefined ? [/(scribe)/g] : arguments[1];

      this.expose(expose);

      ignore = Array.isArray(ignore) ? ignore : [ignore];

      return function (req, res, next) {
        var start = _time();
        (0, _onFinished2.default)(res, function () {
          var originalUrl = req.originalUrl;
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = (0, _getIterator3.default)(ignore), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var k = _step.value;

              if (new RegExp(k).test(originalUrl)) return;
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

          _this2[expose]({ req: req, res: res, duration: _time() - start });
        });
        next();
      };
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
      for (var i = 1; i < arguments.length; i += 2) {
        map[arguments.length <= i - 1 + 0 ? undefined : arguments[i - 1 + 0]] = arguments.length <= i + 0 ? undefined : arguments[i + 0];
      }

      this.transient('metrics', (0, _assign2.default)(this.transient('metrics') || {}, map));

      return this;
    }
  }, {
    key: 'trace',
    value: function trace(text) {
      this.transient('callsite', this.callSite(4));
      return this.out('trace', new Error(text));
    }
  }, {
    key: 'timeEnd',
    value: function timeEnd(label) {
      var start = this._times.get(label);
      if (!start) {
        throw new Error('No such label: ' + label);
      }

      this._times.delete(label);

      this.transient('callsite', this.callSite(5));

      var duration = _time() - start;

      return this.metric(label, duration).timing('');
    }
  }]);
  return _class;
}(_Console3.default);

exports.default = _class;
