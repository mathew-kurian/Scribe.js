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

var sio = undefined;

var SocketIO = function () {
  function SocketIO() {
    var port = arguments.length <= 0 || arguments[0] === undefined ? 4000 : arguments[0];
    var debug = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
    (0, _classCallCheck3.default)(this, SocketIO);

    process.env.DEBUG = debug && 'socket.io*';

    if (!sio) {
      sio = (0, _socket2.default)(port);
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
