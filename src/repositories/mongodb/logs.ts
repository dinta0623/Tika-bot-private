import { Schema, model } from 'mongoose'
const Logs = new Schema({
  _id: {
    type: String,
    required: true,
  },
  error: {
    type: Array,
    required: false,
  },
  changes: {
    type: Array,
    required: false,
  },
})
export default model('logs', Logs, 'logs')
