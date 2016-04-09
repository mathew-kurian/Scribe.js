import io from 'socket.io'

let sio;

export default class SocketIO {
  constructor(scribe) {
    this.options = scribe.module('writer/SocketIO').options;

    if (!sio) {
      sio = io(this.options.port, this.options.options);
    }
  }

  through(data, callback) {
    sio.sockets.emit('data', data);
    callback(null, data);
  }
}