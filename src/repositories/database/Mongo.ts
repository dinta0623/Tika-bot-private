import mongoose, {
  Query,
  Document,
  Model,
  SaveOptions,
  QueryOptions,
} from 'mongoose'
import { MongoObject } from 'discord.js'
import DBWrapper from './DBWrapper'
declare module 'mongoose' {
  interface newOpts extends ConnectOptions {
    dir: string
  }
}
export default class Mongo extends DBWrapper {
  uri: string
  conn?: mongoose.Connection
  items: Map<string, any>
  constructor(uri: string, options?: mongoose.newOpts) {
    super(options!.dir)
    this.uri = String(uri)
    this.items = new Map()
  }
  async connect() {
    mongoose.connect(
      'mongodb+srv://mamank:indonesia@cluster0.o1xee.mongodb.net/bot?retryWrites=true&w=majority',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      }
    )
    this.conn = mongoose.connection
  }
  async load() {
    super.load()
    try {
      await this.connect()
    } catch (message) {
      throw new Error(
        JSON.stringify({
          name: 'load-resolver',
          code: new Date().getMilliseconds(),
          from: process.cwd(),
          message,
        })
      )
    }
  }
  async resolveModel(id: keyof MongoObject | string): Promise<Model<Document>> {
    if (this.models.has(id)) {
      return this.models.get(id) as Model<Document>
    }
    throw new Error(
      JSON.stringify({
        name: 'model-resolver',
        code: new Date().getMilliseconds(),
        from: process.cwd(),
        message: 'model doesnt exist',
      })
    )
  }
  async get<K extends keyof MongoObject>(
    model: K,
    query: object
  ): Promise<Query<Document[], Document> | undefined> {
    try {
      const data = await this.resolveModel(model)
      return data?.find(query)
    } catch (message) {
      throw new Error(
        JSON.stringify({
          name: 'get',
          code: new Date().getMilliseconds(),
          from: process.cwd(),
          message,
        })
      )
    }
  }
  async has(model: string, condition: object): Promise<boolean> {
    try {
      const data = await this.resolveModel(model)
      return data ? data.exists(condition) : false
    } catch (message) {
      throw new Error(
        JSON.stringify({
          name: 'has-data',
          code: new Date().getMilliseconds(),
          from: process.cwd(),
          message,
        })
      )
    }
  }
  async getById<K extends keyof MongoObject>(
    model: K,
    id: string
  ): Promise<Document<any> | null | undefined> {
    try {
      const data = await this.resolveModel(model)
      return data?.findById(id).exec()
    } catch (message) {
      throw new Error(
        JSON.stringify({
          name: 'get-by-id',
          code: new Date().getMilliseconds(),
          from: process.cwd(),
          message,
        })
      )
    }
  }
  async getAll<K extends keyof MongoObject>(
    model: K
  ): Promise<Document<any>[] | undefined> {
    try {
      const data = await this.resolveModel(model)
      return data?.find().exec()
    } catch (message) {
      throw new Error(
        JSON.stringify({
          name: 'get-all',
          code: new Date().getMilliseconds(),
          from: process.cwd(),
          message,
        })
      )
    }
  }
  async add<K extends keyof MongoObject>(
    model: K,
    newData: MongoObject[K],
    opts?: SaveOptions
  ): Promise<any> {
    try {
      const data = await this.resolveModel(model)
      return await new data(newData).save(
        Object.assign(this, {
          ...opts,
          timestamps: true,
        })
      )
    } catch (message) {
      throw new Error(
        JSON.stringify({
          name: 'add',
          code: new Date().getMilliseconds(),
          from: process.cwd(),
          message,
        })
      )
    }
  }
  async setOne<T extends keyof MongoObject>(
    model: T,
    query: Object,
    newData: Object,
    opts?: QueryOptions
  ): Promise<any> {
    try {
      const data = await this.resolveModel(model)
      return await data.updateOne(query, newData, { upsert: false, ...opts })
    } catch (message) {
      throw new Error(
        JSON.stringify({
          name: 'set-one',
          code: new Date().getTime(),
          from: process.cwd(),
          message,
        })
      )
    }
  }

  async DeleteOne<T extends keyof MongoObject>(
    model: T,
    query: Object,
    opts?: QueryOptions
  ) {
    try {
      const data = await this.resolveModel(model)
      return await data.deleteOne(query, opts)
    } catch (message) {
      throw new Error(
        JSON.stringify({
          name: 'set-one',
          code: new Date().getTime(),
          from: process.cwd(),
          message,
        })
      )
    }
  }
}
