import * as JSON2 from '../libs/JSON2'

export default class FullTextSerialize {
  through(data, callback) {
    data.serialized = JSON2.stringify(data);
    callback(null, data);
  }
}