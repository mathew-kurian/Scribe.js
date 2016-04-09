'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = time;
function time() {
  if (typeof process !== 'undefined' && typeof process.hrtime === 'function') {
    var duration = process.hrtime();
    return duration[0] * 1000 + duration[1] / 1e6;
  }

  return Date.now();
}
