import { Schema, model } from 'mongoose'
const Todo = new Schema({
  guild: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  values: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
})
export default model('todo', Todo, 'todo')
