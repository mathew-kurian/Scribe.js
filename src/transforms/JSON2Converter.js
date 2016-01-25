import * as JSON2 from '../libs/JSON2'

export default class JSON2Converter {
  through(data, callback) {
    callback(null, JSON.parse(JSON2.stringify(data)));
  }
}