import {Schema} from 'mongoose'

const EntrySchema = new Schema({
  transient: Schema.Types.Object,
  persistent: Schema.Types.Object,
  args: Schema.Types.Object,
  date: {type: Date, default: Date.now},
  expose: String,
  serialized: String // experimental
});

EntrySchema.index({'persistent.app': 1, 'persistent.id': -1});

export default EntrySchema;