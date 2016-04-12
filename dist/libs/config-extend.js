'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = extend;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function extend() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return _lodash2.default.mergeWith.apply(_lodash2.default, args.concat([function (obj, src) {
    return Array.isArray(src) ? src : undefined;
  }]));
}
