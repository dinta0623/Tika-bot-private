import { Role } from 'discord.js'
import { GuildChannel } from 'discord.js'
import {
  Message,
  User,
  Snowflake,
  Collection,
  GuildMember,
  MessageEmbed,
  IWrapper,
  Argument,
} from 'discord.js'
import BotClient from './BotClient'
import { intoCallable } from './utils/stuff'

export default class Wrapper implements IWrapper {
  id: string
  client: BotClient | null
  filepath?: string
  handler?: any
  constructor(id: string) {
    this.id = id
    this.client = null
  }
  NewEmbed() {
    return new MessageEmbed().setTimestamp()
  }
  resolveUser(text: string, users: Collection<string, User>): User | undefined {
    return users.get(text) || users.find((user) => this.checkUser(text, user))
  }
  resolveUsers(
    text: string,
    users: Collection<string, User>
  ): Collection<Snowflake, User> {
    return users.filter((user) => this.checkUser(text, user))
  }
  checkUser(text: string, user: User): boolean {
    if (user.id === text) return true
    // text bentun mention{id}
    const reg = /<@!?(\d{17,19})>/
    const match = text.match(reg)

    if (match && user.id === match[1]) return true
    const data = {
      name: [user.username],
      discrim: user.discriminator,
    }

    return Boolean(
      data.name.includes(text) ||
        (data.name.includes(text.split('#')[0]) &&
          data.discrim.includes(text.split('#')[1]))
    )
  }
  /**
   * @description Membantu mencari member berdasarkan plain text
   * @param text {string} - keyword member
   * @param members {GuildMember} - kumpulan list member dari guild
   * @param caseSensitive {boolean} - textnya UPPER atau LOWER case
   * @param wholeWord {boolean} - textnya keseluruhan ?
   * @returns GuildMember | undefined
   */
  resolveMember(text: string, msg: Message): GuildMember | undefined {
    const members = msg.guild!.members.cache
    return (
      members.get(text) ||
      members.find((member) => this.checkMember(text, member))
    )
  }
  /**
   * @description Generate Otomatis Warna Role Tertinggi dari Author
   * @param msg {Message} discord message
   * @returns string
   */
  ColorUser(msg: Message, user: User): string {
    return msg && (msg.guild?.member(user)?.roles.color?.hexColor as string)
  }

  checkMember(text: string, member: GuildMember): any {
    // kalau textnya id
    if (member.id === text) return true
    // kalau textnya mention
    const reg = /<@!?(\d{17,19})>/
    const match = text.match(reg)
    if (match && member.id === match[1]) return true
    const data = {
      name: [
        member.user.username.toLowerCase(),
        member.displayName.toLowerCase(),
        member.nickname?.toLowerCase(),
        member.user.username,
        member.displayName,
        member.nickname,
      ],
      discrim: [member.user.discriminator],
    }
    return Boolean(
      text
        .split(/\s+/)
        .find(
          (e) =>
            data.name.includes(e) ||
            (data.name.includes(e.toLowerCase().split('#')[0]) &&
              data.discrim.includes(e.split('#')[1]))
        )
    )
  }
  resolveAsc(a: any, b: any) {
    if (a.rawPosition < b.rawPosition) return 1
    if (a.rawPosition > b.rawPosition) return -1
    return 0
  }

  resolveRole(text: string, msg: Message) {
    const roles = msg.guild!.roles.cache
    return roles.get(text) || roles.find((role) => this.checkRoles(text, role))
  }

  resolveChannel(text: string, msg: Message) {
    const channels = msg.guild!.channels.cache
    return (
      channels.get(text) ||
      channels.find((channel) => this.checkChannels(text, channel))
    )
  }

  checkRoles(text: string, roles: Role): boolean {
    if (roles.id === text) return true
    let match: any = /<#(\d{17,18})>/
    match = text.match(match) as RegExpMatchArray | null
    if (match && match[1] === roles.id) return true
    const last = roles.name.toLowerCase()
    return Boolean(
      roles.name === text || last === text || last === text.toLowerCase()
    )
  }

  checkChannels(text: string, channel: GuildChannel): boolean {
    if (channel.id === text) return true
    let match: any = /<#\d{17,18}>/
    match = text.match(match) as RegExpMatchArray | null
    if (match && match[1] === channel.id) return true
    const last = channel.name.toLowerCase()
    return Boolean(
      channel.name === text || last === text || last === text.toLowerCase()
    )
  }
  // similiarityString(keyA: string, keyB:string): number{
  //   // rules |a| = 0 / |b| = 0 otherwise a|0| = b|0|
  //   let long: typeof keyA, short:typeof keyB
  //   if (keyA < keyB) {
  //     long = keyB
  //     short = keyA
  //   } else {
  //     long = keyA
  //     short = keyB
  //   }
  //   let lengthLong = long.length
  //   if (lengthLong = 0) return 1

  // }

  reSort(data: Array<any>, page: number, total: number): Array<any> {
    const end = total * page
    return data.slice(end - total, end)
  }

  async resolveArgue<T extends any>(
    args: Array<Argument>,
    msg: Message,
    separator: string | RegExp = /\s{1,}|\n{1,}/
  ): Promise<Array<T | any>> {
    let index: number = 0
    let content = msg.content.toLowerCase().slice(index).trim()
    separator =
      typeof separator === 'function'
        ? Function(separator).bind(this)
        : separator
    for (let i = 0; i < args.length; i++) {
      let match
      content = content.toLowerCase().slice(index).trim()
      const splited = content.split(separator)
      const defaults =
        typeof args[i].default === 'function'
          ? await intoCallable(args[i].default)(msg)
          : args[i].default
      if (args[i].match === 'flag') {
        match = args[i].flag?.find((e) => content.match(e)) as string
        args[i].default = match ? match : defaults
        index = match ? content.indexOf(match) + match.length : 0
      } else if (args[i].match === 'number') {
        match = content.match(/\d+/)
        args[i].default = match ? match[0] : defaults
        index = match ? Number((match.index as number) + match[0].length) : 0
      } else if (args[i].match === 'member') {
        match = splited.find((e) => this.resolveMember(e, msg))
        args[i].default = match ? this.resolveMember(match, msg) : defaults
        index = match ? Number(content.indexOf(match) + match.length) : 0
      } else if (args[i].match === 'role') {
        match = splited.find((e) => this.resolveRole(e, msg))
        args[i].default = match ? this.resolveRole(match, msg) : defaults
        index = match ? Number(content.indexOf(match) + match.length) : 0
      } else if (args[i].match === 'channel') {
        match = splited.find((e) => this.resolveChannel(e, msg))
        args[i].default = match ? this.resolveChannel(match, msg) : defaults
        index = match ? Number(content.indexOf(match) + match.length) : 0
      } else if (args[i].match === 'text') {
        match = content.toString()
        args[i].default = match ? match : defaults
        index = match ? Number(content.indexOf(match[0]) + match.length) : 0
      } else if (args[i].match === 'endWord') {
        match = content.match(/\w+$/)
        args[i].default = match ? match[0] : defaults
        index = match ? Number(content.indexOf(match[0]) + match.length) : 0
      } else if (args[i].match === 'regex') {
        match = content.match(args[i].regex as RegExp | string)
        args[i].default = match ? match[0] : defaults
        index = match ? Number(content.indexOf(match[0]) + match.length) : 0
      }
    }
    return args.map((e) => e.default)
  }
}
