"use strict";

var _map = require("babel-runtime/core-js/map");

var _map2 = _interopRequireDefault(_map);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _class = function () {
  function _class() {
    (0, _classCallCheck3.default)(this, _class);

    this._map = new _map2.default();
  }

  (0, _createClass3.default)(_class, [{
    key: "get",
    value: function get(key) {
      if (!this._map.has(key)) {
        this._map.set(key, []);
      }

      return this._map.get(key);
    }
  }, {
    key: "has",
    value: function has(key) {
      return Array.isArray(this._map.get(key));
    }
  }, {
    key: "set",
    value: function set(key) {
      var data = this.get(key);

      for (var _len = arguments.length, values = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        values[_key - 1] = arguments[_key];
      }

      this._map.set(key, data.concat.apply(data, values));

      return this;
    }
  }, {
    key: "remove",
    value: function remove(key) {
      this._map.set(key, []);
    }
  }, {
    key: "move",
    value: function move(old, key) {
      this._map.set(key, this._map.get(old));
      this._map.remove(old);
    }
  }]);
  return _class;
}();

exports.default = _class;
