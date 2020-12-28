import { Schema, model } from 'mongoose'
const Guilds = new Schema({
  _id: {
    type: String,
    required: true,
  },
  prefix: {
    type: String,
    default: 'w/',
  },
  owner: {
    type: String,
    required: true,
  },
  stuff: {
    type: Map,
    of: Object,
    required: false,
  },
})
export default model('guilds', Guilds, 'guilds')
