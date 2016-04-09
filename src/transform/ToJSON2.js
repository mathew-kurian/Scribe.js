import * as JSON2 from '../libs/JSON2'

export default class ToJSON2 {
  through(data, callback) {
    callback(null, JSON.parse(JSON2.stringify(data)));
  }
}