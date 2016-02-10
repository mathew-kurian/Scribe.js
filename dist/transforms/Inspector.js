'use strict';

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _inspect = require('../libs/inspect');

var _inspect2 = _interopRequireDefault(_inspect);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function inspect(x, ctx) {
  return typeof x === 'string' ? x : (0, _inspect2.default)(x, ctx);
}

var Inspector = function () {
  function Inspector() {
    var inspectOpts = arguments.length <= 0 || arguments[0] === undefined ? { colors: true, showHidden: false,
      depth: 5, pre: true, args: true, metrics: true, tags: true } : arguments[0];
    (0, _classCallCheck3.default)(this, Inspector);

    this.inspectOpts = inspectOpts;
  }

  (0, _createClass3.default)(Inspector, [{
    key: 'format',
    value: function format(f) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      var ctx = this.inspectOpts;

      if (typeof f !== 'string') {
        var objects = [];
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = (0, _getIterator3.default)([f].concat(args)), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var arg = _step.value;

            objects.push(inspect(arg, ctx));
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

        return objects.join(' ');
      }

      if (!args.length) {
        return f;
      }

      var i = 0;
      var len = args.length;
      var str = String(f).replace(/%[sdj%]/g, function (x) {
        if (x === '%%') return '%';
        if (i >= len) return x;
        switch (x) {
          default:
          case '%s':
          case '%d':
          case '%j':
            return inspect(args[i++], ctx);
        }
      });

      for (var x = args[i]; i < len; x = args[++i]) {
        str += ' ' + inspect(x, ctx);
      }

      return str;
    }
  }, {
    key: 'inspectArguments',
    value: function inspectArguments(data) {
      if (!data.length) return '';
      return this.format.apply(this, (0, _toConsumableArray3.default)(data.args));
    }
  }, {
    key: 'inspectTags',
    value: function inspectTags(data) {
      return (data.persistent['tags'] || []).map(function (tag) {
        return _chalk2.default.cyan('' + String(tag).toUpperCase());
      }).concat((data.transient['tags'] || []).map(function (tag) {
        return _chalk2.default.magenta('' + String(tag).toUpperCase());
      })).join(' ');
    }
  }, {
    key: 'inspectPre',
    value: function inspectPre(data) {
      return [_chalk2.default.yellow.bgBlack(data.persistent['app'] + '-' + data.persistent['id']), _chalk2.default.black.bgYellow(' ' + data.expose.toUpperCase() + ' ')].join(' ');
    }
  }, {
    key: 'inspectMetrics',
    value: function inspectMetrics(data) {
      return _underscore2.default.map(data.transient['metrics'], function (value, key) {
        return _chalk2.default.cyan(key + '(' + (typeof value === 'number' ? value.toFixed(3) : value) + ')');
      }).join(' ');
    }
  }, {
    key: 'inspectCallSite',
    value: function inspectCallSite(data) {
      var site = data.transient['callsite'];
      if (typeof site === 'string') return _chalk2.default.gray.dim(site);

      var _ref = site || { file: '', line: -1 };

      var file = _ref.file;
      var line = _ref.line;

      return _chalk2.default.gray.dim(file.replace(/^.*[\\\/]/, '') + ':' + line);
    }
  }, {
    key: 'through',
    value: function through(data, callback) {
      if (data.expose === 'metric') {
        data.args = '';
      }

      var pre = this.inspectOpts.pre ? this.inspectPre(data) + ' ' : '';
      var tags = this.inspectOpts.tags ? this.inspectTags(data) : '';
      var metrics = this.inspectOpts.metrics ? this.inspectMetrics(data) : '';
      var site = this.inspectOpts.callsite ? this.inspectCallSite(data) : '';
      var pretty = this.inspectOpts.args ? this.inspectArguments(data) : '';
      var inspected = pretty.split('\n').map(function (line) {
        return pre + ' ' + [tags, metrics, line, site].join(' ');
      });

      data.inspected = inspected;

      callback(null, data);
    }
  }]);
  return Inspector;
}();

exports.default = Inspector;
