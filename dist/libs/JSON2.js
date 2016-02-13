'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

exports.parse = parse;
exports.stringify = stringify;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function parse(str, reviver) {
  return JSON.parse(str, function (k, v) {
    var rv = undefined;
    if (typeof v === 'string') {
      if (/^Promise \{(.*?)}$/g.test(v)) {
        return new _promise2.default(function (r, e) {
          return 0;
        });
      } else if (/^function ([a-zA-Z0-9_\$]*?)\((.*?)\)\s?\{(.*?)}$/g.test(rv = v.replace(/\n/g, ''))) {
        try {
          var x = undefined;
          eval('x = ' + v);
          if (x) {
            return x;
          }
        } catch (e) {
          // ignore
        }
      }

      try {
        if ((rv = new RegExp(v)).toString() === v) {
          return rv;
        }
      } catch (e) {
        // ignore
      }
    }

    return v;
  });
}

function stringify(obj, replacer, spaces) {
  return (0, _stringify2.default)(obj, function (k, v) {
    if (typeof v !== 'undefined' && v !== null) {
      if (typeof v.then === 'function') {
        return 'Promise { <pending> }';
      } else if (typeof v === 'function') {
        return v.toString().replace(/\[native code]/gm, '[native]');
      } else if (v instanceof RegExp) {
        return v.toString();
      }
    }

    return v;
  }, spaces);
}
