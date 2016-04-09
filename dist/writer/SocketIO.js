'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _socket = require('socket.io');

var _socket2 = _interopRequireDefault(_socket);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var sio = void 0;

var SocketIO = function () {
  function SocketIO(scribe) {
    (0, _classCallCheck3.default)(this, SocketIO);

    this.options = scribe.module('writer/SocketIO').options;

    if (!sio) {
      sio = (0, _socket2.default)(this.options.port, this.options.options);
    }
  }

  (0, _createClass3.default)(SocketIO, [{
    key: 'through',
    value: function through(data, callback) {
      sio.sockets.emit('data', data);
      callback(null, data);
    }
  }]);
  return SocketIO;
}();

exports.default = SocketIO;
