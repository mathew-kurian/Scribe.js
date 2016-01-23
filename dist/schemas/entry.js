'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var EntrySchema = new _mongoose.Schema({
  transient: _mongoose.Schema.Types.Object,
  persistent: _mongoose.Schema.Types.Object,
  args: _mongoose.Schema.Types.Object,
  date: { type: Date, default: Date.now },
  expose: String,
  serialized: String // experimental
});

EntrySchema.index({ 'persistent.app': 1, 'persistent.id': -1 });

exports.default = EntrySchema;
