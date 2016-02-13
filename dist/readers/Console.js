'use strict';

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _callsite = require('callsite');

var _callsite2 = _interopRequireDefault(_callsite);

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _class = function () {
  function _class() {
    var app = arguments.length <= 0 || arguments[0] === undefined ? 'Scribe' : arguments[0];
    var id = arguments.length <= 1 || arguments[1] === undefined ? process.pid : arguments[1];
    (0, _classCallCheck3.default)(this, _class);

    this._transient = {};
    this._persistent = {};
    this._pipelines = {};
    this._exposed = {};

    this.persistent('app', app);
    this.persistent('id', id);
  }

  (0, _createClass3.default)(_class, [{
    key: 'transient',
    value: function transient(key, value) {
      if (arguments.length === 1) {
        return this._transient[key];
      }

      this._transient[key] = value;
      return this;
    }
  }, {
    key: 'persistent',
    value: function persistent(key, value) {
      if (arguments.length === 1) {
        return this._persistent[key];
      }

      this._persistent[key] = value;
      return this;
    }
  }, {
    key: 'exposed',
    value: function exposed() {
      return (0, _keys2.default)(this._exposed);
    }
  }, {
    key: 'callSite',
    value: function callSite() {
      var idx = arguments.length <= 0 || arguments[0] === undefined ? 5 : arguments[0];

      try {
        var site = (0, _callsite2.default)()[idx];

        return {
          line: site.getLineNumber(),
          file: site.getFileName(),
          func: site.getFunctionName()
        };

        return site;
      } catch (e) {
        return { line: 0, file: '-', func: '-' };
      }
    }
  }, {
    key: 'preout',
    value: function preout() {
      // ignore
    }
  }, {
    key: 'out',
    value: function out(expose) {
      var _this = this;

      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      return new _promise2.default(function (resolve, reject) {
        if (!_this._pipelines[expose]) {
          return resolve();
        }

        _this.preout();

        var pipelines = _this._pipelines[expose];
        var transient = _this._transient;
        var persistent = _this._persistent;
        var errs = [];
        var now = new Date();

        if (!transient.date) {
          transient.date = now;
        }

        if (!transient.callsite) {
          transient.callsite = _this.callSite();
        }

        if (!args.length) {
          args = [''];
        }

        // reset before async
        _this.reset();

        _async2.default.forEachOfSeries(pipelines, function (pipeline, name, callback) {
          var input = {
            expose: expose, args: args, persistent: persistent, date: now,
            transient: (0, _assign2.default)({}, transient)
          };

          _async2.default.eachSeries(pipeline, function (through, callback) {
            if (!through) {
              return callback();
            }

            through.through(input, function (err, output) {
              if (err) errs.push(err);
              input = output || input;
              callback(err);
            });
          }, function () {
            return callback();
          });
        }, function () {
          if (errs.length) {
            return reject(errs);
          }

          resolve();
        });
      });
    }
  }, {
    key: 'expose',
    value: function expose(_expose) {
      if (typeof this[_expose] !== 'function') {
        this[_expose] = this.out.bind(this, _expose);
      }

      this._exposed[_expose] = true;

      return this;
    }
  }, {
    key: 'pipe',
    value: function pipe(expose, name) {
      this.expose(expose);

      for (var _len2 = arguments.length, throughs = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
        throughs[_key2 - 2] = arguments[_key2];
      }

      if (throughs.length) {
        var t = this._pipelines[expose] || {};
        if (t[name]) {
          throw new Error('Pipeline ' + name + ' for ' + expose + ' is already taken');
        }

        t[name] = throughs;
        this._pipelines[expose] = t;
      } else {
        return this._pipelines[expose][name];
      }

      return this;
    }
  }, {
    key: 'reset',
    value: function reset() {
      this._transient = {};
      return this;
    }
  }, {
    key: 'override',
    value: function override() {
      global._console = console;

      delete global.console;

      Object.defineProperty(global, 'console', {
        enumerable: true,
        configurable: true,
        writable: false,
        value: this
      });

      return this;
    }
  }]);
  return _class;
}();

exports.default = _class;
