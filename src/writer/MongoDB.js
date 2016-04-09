import mongoose, {Schema} from 'mongoose';
import * as JSON2 from '../libs/JSON2';
import express, {Router} from 'express';
import jade from 'jade';
import basicAuth from 'basic-auth-connect';
import bodyParser from 'body-parser'
import JSONStream from 'JSONStream';

export const EntrySchema = new Schema({
  transient: Schema.Types.Object,
  persistent: Schema.Types.Object,
  args: Schema.Types.Object,
  date: {type: Date, default: Date.now},
  expose: String,
  serialized: String
});

EntrySchema.index({'persistent.app': 1, 'persistent.id': -1});
EntrySchema.index({'serialized': 1, 'comment': 'text'});

export default class MongoDB {
  constructor(scribe) {
    this.options = scribe.module('writer/MongoDB').options;

    const conn = mongoose.createConnection(this.options.uri);
    this._debug = this.options.debug;
    this._entry = conn.model('Entry', EntrySchema);
  }

  get Entry() {
    return this._entry;
  }

  through(data, callback) {
    new this.Entry(data).save((err, data) => {
      if (err && this._debug) console.error(err);
      callback(err, data);
    });
  }
}

