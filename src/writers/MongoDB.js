import mongoose from 'mongoose'
import EntrySchema from '../schemas/entry'
import * as JSON2 from '../libs/JSON2'

export default class MongoDB {
  constructor(address = 'mongodb://localhost/scribe', debug = false) {
    mongoose.set('debug', debug);

    const conn = mongoose.createConnection(address);
    this._debug = debug;
    this._entry = conn.model('Entry', EntrySchema);
  }

  get Entry() {
    return this._entry;
  }

  through(data, callback) {
    new this.Entry(JSON.parse(JSON2.stringify(data))).save((err, data) => {
      if (err && this._debug) console.error(err);
      callback(err, data);
    });
  }
}