import { resolve, join, extname } from 'path'
import { readdirSync, statSync } from 'fs'
import { EventEmitter } from 'events'
import { IBotHandler } from 'discord.js'
import { Collection } from 'discord.js'
import BotClient from './BotClient'
import Wrapper from './BotWrapper'

export default class BotHandler extends EventEmitter implements IBotHandler {
  protected dir: string
  protected moduleHandle: any
  protected client: BotClient
  extensions: Set<any>
  modules: Collection<string, any>
  constructor(
    client: BotClient,
    others: {
      dir: string
      extensions?: string[]
      moduleHandle?: any
    }
  ) {
    super()
    this.client = client
    this.extensions = new Set(others.extensions || ['.js', '.ts'])
    this.dir = others.dir
    this.moduleHandle = others.moduleHandle || Wrapper
    this.modules = new Collection()
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

  async preload(module: any, filepath: any): Promise<void> {
    module.filepath = filepath
    module.client = this.client
    module.handler = this
    this.modules.set(module.id, module)
    console.info(`Module ${module.id} has ready ✅`)
  }

  async load(file: any): Promise<any> {
    const isClass = typeof file === 'function'
    if (!isClass && !this.extensions.has(extname(file as string))) {
      return undefined
    }
    let module = isClass ? file : require(file).default
    if (module && module.prototype instanceof this.moduleHandle) {
      module = new module(this)
    } else {
      if (!isClass) {
        delete require.cache[require.resolve(file as string)]
      }
      return undefined
    }
    if (this.modules.has(module.id)) throw new Error('Sudah Ke Load !!')
    await this.preload(module, isClass ? null : file)
    return module
  }

  async loadAll(): Promise<any> {
    const filepaths = this.readdirRecursive(this.dir)
    filepaths.forEach((filepath) => {
      filepath = resolve(filepath)
      this.load(filepath)
    })
    return this
  }
}
