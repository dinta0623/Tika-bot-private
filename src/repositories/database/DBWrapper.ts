import { join, resolve } from 'path'
import { readdirSync, statSync } from 'fs'
import { EventEmitter } from 'events'
import { Model, Document } from 'mongoose'
export default class DBWrapper extends EventEmitter {
  dir: string
  models: Map<string, Model<Document>>
  constructor(dir: string) {
    super()
    this.dir = dir
    this.models = new Map()
  }
  async load() {
    const filepaths = this.readdirRecursive(this.dir)
    filepaths.forEach((filepath) => {
      filepath = resolve(filepath)
      const result = require(filepath).default as Model<Document>
      this.models.set(result.modelName.toLowerCase(), result)
    })
    return
  }
  protected readdirRecursive(directory: any) {
    const result = []
    ;(function read(dir) {
      const files = readdirSync(dir)
      for (const file of files) {
        const filepath = join(dir, file)
        if (statSync(filepath).isDirectory()) {
          read(filepath)
        } else {
          result.push(filepath)
        }
      }
    })(directory)
    return result
  }
}
