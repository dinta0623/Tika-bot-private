import {
  ICommandHandler,
  Tignore,
  Collection,
  Message,
  StringFunction,
  StringArrayFunction,
  PermissionString,
} from 'discord.js'
import BotClient from '../BotClient'
import BotHandler from '../BotHandler'
import Command from '.'
import { intoArray, intoCallable } from '../utils/stuff'

export default class CommandHandler
  extends BotHandler
  implements ICommandHandler {
  prefix: string | StringFunction
  ignorePerms: string | string[] | StringArrayFunction | undefined
  ignoreCooldown: Tignore | undefined
  blockBots: boolean | undefined
  cooldowns: Collection<string, any>
  aliases: Collection<string, any>
  allowMentions?: boolean
  fetchMembers?: boolean
  cacheUsers?: boolean
  cacheChannels?: boolean
  cachePresence?: boolean
  defaultCooldowns?: number
  constructor(
    /**
     * @type {BotClient}
     */
    client: BotClient,
    /**
     * options needed for the handler
     * @type {Object}
     */
    options: {
      dir: string
      /**
       * @param msg {Message} from discord.js
       */
      prefix: string | StringFunction
      allowMentions: boolean
      fetchMembers?: boolean
      cacheUsers?: boolean
      cacheChannels?: boolean
      cachePresence?: boolean
      blockBots?: boolean
      defaultCooldowns?: number
      ignorePerms?: Tignore
      ignoreCooldown?: Tignore
    }
  ) {
    super(client, {
      dir: options.dir,
      extensions: ['.js', '.ts'],
      moduleHandle: Command,
    })
    this.prefix =
      typeof options.prefix === 'function'
        ? options.prefix.bind(this)
        : options.prefix
    this.ignoreCooldown =
      typeof options.ignoreCooldown === 'function'
        ? options.ignoreCooldown.bind(this)
        : options.ignoreCooldown
    this.ignorePerms =
      typeof options.ignorePerms === 'function'
        ? options.ignorePerms.bind(this)
        : options.ignorePerms
    this.defaultCooldowns = options.defaultCooldowns
    this.fetchMembers = Boolean(options.fetchMembers || false)
    this.allowMentions = Boolean(options.allowMentions || false)
    this.cacheChannels = Boolean(options.cacheChannels || true)
    this.cachePresence = Boolean(options.cachePresence || false)
    this.blockBots = Boolean(this.blockBots || false)
    this.cooldowns = new Collection()
    this.aliases = new Collection()
    this.initialize()
  }

  initialize() {
    this.client.once('ready', () =>
      this.client.on('message', async (msg: Message) => {
        if (msg.partial) await msg.fetch()
        this.handleMessage(msg)
      })
    )
  }

  async preload(module: any, filepath: any): Promise<void> {
    super.preload(module, filepath)
    try {
      module.alias.forEach((arg: string) => {
        if (this.aliases.has(arg.toLowerCase())) {
          this.emit('error', 'duplicate alias was found')
        }
        this.aliases.set(arg.toLowerCase(), module.id)
      })
    } catch (error) {
      console.warn(error)
    }
  }

  async parseCommand(msg: Message) {
    const allowMention = await intoCallable(this.prefix)(msg)
    let prefixes: Array<string> = intoArray(await allowMention)
    if (allowMention && this.allowMentions) {
      const mentions = [
        `<@${this.client.user!.id}>`,
        `<@!${this.client.user!.id}>`,
      ]
      prefixes = [...mentions, ...prefixes]
    }
    return this.parseNext(msg, prefixes)
  }

  parseNext(msg: Message, prefixes: any[]) {
    const lowerContent = msg.content.toLowerCase()
    const prefix = prefixes.find((e) =>
      lowerContent.startsWith(e.toLowerCase())
    )
    if (!prefix) return {}
    const endOfPrefix = // expected result is 2 if prefix equals t!
      lowerContent.indexOf(prefix!.toLowerCase()) + prefix.length
    //search yg bukan whitespace
    const startOfArgs =
      msg.content.slice(endOfPrefix).search(/\S/) + prefix.length
    // console.log(prefix.length)
    // console.log(msg.content.slice(endOfPrefix))
    // console.log(msg.content.slice(endOfPrefix).search(/\S/))
    // => split dengan 1 whitespace seterusnya atau 1 \n escaped seterusnya
    const alias = msg.content.slice(startOfArgs).split(/\s{1,}|\n{1,}/)[0]
    const command: Command = this.modules.get(
      this.aliases.get(alias.toLowerCase()) as string
    )
    const content = msg.content.slice(startOfArgs + alias.length + 1).trim()
    const afterPrefix = msg.content.slice(prefix!.length).trim()
    if (!command) {
      return { prefix, alias, content, afterPrefix }
    }
    return { command, prefix, alias, content, afterPrefix }
  }

  async handlerPreventer(msg: Message, cmd: Command) {
    if (msg.guild && !['guild', 'both'].includes(cmd.channel as string))
      return true
    if (!msg.guild && !['dm', 'both'].includes(cmd.channel as string))
      return true
    if (cmd.ownerOnly && !this.client.checkOwner(msg.author)) {
      return true
    }
    if (this.blockBots && msg.author.bot) {
      return true
    }
    if (
      cmd.userPerms &&
      !msg.member?.hasPermission(cmd.userPerms) &&
      !intoArray(await intoCallable(this.ignorePerms)(msg)).includes(
        msg.author.id
      )
    ) {
      return true
    }
  }

  async handleMessage(msg: Message): Promise<void> {
    if (this.fetchMembers && msg.guild && !msg.member && !msg.webhookID) {
      msg.guild.members.fetch(msg.author)
    }
    const result = await this.parseCommand(msg)
    if (result.command) {
      msg.content = result.content
      if ((await this.handlerPreventer(msg, result.command)) === true) return
      if ((await this.runCooldowns(msg, result.command)) === true) return
      await this.runCommand(msg, result.command)
      this.handleCached(msg)
    }
  }

  handleCached(msg: Message) {
    if (this.cacheChannels === false) {
      let connections = this.client.voice
        ? this.client.voice.connections.map((t) => t.channel.id)
        : []
      this.client.channels.cache.sweep((t) => !connections.includes(t.id))
    }
    if (this.cacheChannels === false) {
      msg.guild?.channels.cache.delete(msg.channel.id)
    }
    if (this.cachePresence === false) {
      msg.guild?.presences.cache.delete(msg.author.presence.userID)
    }
    if (this.fetchMembers === false) {
      msg.guild?.members.cache.delete(msg.author.id)
    }
  }

  async runCommand(msg: Message, cmd: Command) {
    if (cmd.typing) msg.channel.startTyping()
    try {
      const before: any = cmd.prerun(msg)
      typeof before.then === 'function' &&
        typeof before.catch === 'function' &&
        (await before)
      if (before === false) return
      cmd.run(msg, this.modules, msg.content.toLowerCase())
    } finally {
      if (cmd.typing) msg.channel.stopTyping()
    }
  }

  async runCooldowns(message: Message, command: Command): Promise<boolean> {
    const ignorer = command.ignoreCooldown || this.ignoreCooldown
    const isIgnored = Array.isArray(ignorer)
      ? ignorer.includes(message.author.id) ||
        message.member?.hasPermission(ignorer as PermissionString[])
      : typeof ignorer === 'function'
      ? ignorer(message)
      : message.author.id === ignorer

    if (isIgnored) return false
    if (!this.defaultCooldowns) return false
    const time = command.cooldown || this.defaultCooldowns
    const endTime = message.createdTimestamp + time

    const id = message.author.id
    if (!this.cooldowns.has(id)) this.cooldowns.set(id, {})
    if (!this.cooldowns.get(id)[command.id]) {
      this.cooldowns.get(id)[command.id] = {
        timer: this.client.setTimeout(() => {
          if (this.cooldowns.get(id)[command.id]) {
            this.client.clearTimeout(this.cooldowns.get(id)[command.id].timer)
          }
          this.cooldowns.get(id)[command.id] = null
          if (!Object.keys(this.cooldowns.get(id)).length) {
            this.cooldowns.delete(id)
          }
        }, time),
        end: endTime,
        uses: 0,
      }
    }
    const entry = this.cooldowns.get(id)[command.id]
    if (entry && entry.uses >= command.limit) {
      const uses = this.cooldowns.get(message.author.id)[command.id].uses
      this.emit('cooldown', message, command, time, uses)
      return true
    }
    entry && entry.uses++
    return false
  }
}
