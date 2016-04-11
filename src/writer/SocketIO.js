import io from 'socket.io'

let sio;

export default class SocketIO {
  constructor(scribe) {
    this.options = scribe.module('writer/SocketIO').options;

    if (!sio) {
      if (typeof this.options.server === 'object') {
        sio = io.listen(this.options.server, this.options.options);
      } else {
        sio = io(this.options.port, this.options.options);
      }
    }
  }

  through(data, callback) {
    sio.sockets.emit('data', data);
    callback(null, data);
  }
}