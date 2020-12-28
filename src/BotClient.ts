import { Message } from 'discord.js'
import { Client, ClientOptions, UserResolvable, IClient } from 'discord.js'
import { config } from 'dotenv'
import { join } from 'path'
import CommandHandler from './commands/Handler'
import EventHandler from './events/Handler'
import Mongo from './repositories/database/Mongo'
config()

export default class BotClient extends Client implements IClient {
  /**
   * @description data persist the bot
   */
  persist: Map<string, any>
  /**
   * @description basic bot config
   * @property {ownerID} - id of the bot owner
   * @property {token} - private bot token
   * @returns {Object} - of ownerId and token inside
   */
  config: { ownerID: string | string[]; token: string }
  db: Mongo = new Mongo('mongodb://127.0.0.1/my_database', {
    dir: join(__dirname, 'repositories/mongodb'),
  })
  commandHandler: CommandHandler = new CommandHandler(this, {
    dir: join(__dirname, 'commands/components'),
    prefix: async (msg: Message) =>
      msg.guild && (await this.db.has('guilds', { _id: msg.guild.id }))
        ? await this.db
            .getById('guilds', msg.guild!.id)
            .then((e) => e?.get('prefix'))
        : 'w/',
    defaultCooldowns: 3000,
    blockBots: true,
    allowMentions: true,
    fetchMembers: true,
    ignorePerms: '565906486996500510',
  })
  eventHandler: EventHandler = new EventHandler(this, {
    dir: join(__dirname, 'events/components'),
  })
  constructor(
    config: { ownerID: string; token: string },
    options?: ClientOptions
  ) {
    super(options)
    this.persist = new Map()
    this.config = config
  }
  checkOwner(user: UserResolvable | string): boolean {
    const id = typeof user === 'string' ? user : this.users.resolveID(user)
    return Array.isArray(this.config.ownerID) && id
      ? this.config.ownerID.includes(id)
      : Boolean(id === this.config.ownerID)
  }
  async init(): Promise<any> {
    await this.db.load()
    await this.db.getAll('guilds').then((e) => {
      if (e && e.length > 0)
        for (let i of e.values()) {
          this.persist.set(i.id as string, i)
        }
    })
    this.eventHandler.setEmitters({
      commandHandler: this.commandHandler,
      eventHandler: this.eventHandler,
      dataHandler: this.db,
    })
    await this.commandHandler.loadAll()
    await this.eventHandler.loadAll()
  }
  async ready(): Promise<void> {
    await this.init()
    await this.login(this.config.token)
  }
}

new BotClient(
  { ownerID: process.env.OWNER as string, token: process.env.TOKEN as string },
  { partials: ['MESSAGE', 'CHANNEL', 'REACTION'], messageCacheMaxSize: 50 }
).ready()
