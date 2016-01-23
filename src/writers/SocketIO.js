import io from 'socket.io'

let sio;

export default class SocketIO {
  constructor(port = 4000, debug = false) {
    process.env.DEBUG = debug;

    if (!sio) {
      sio = io(port);
    }
  }

  through(data, callback) {
    sio.sockets.emit('data', data);
    callback(null, data);
  }
}