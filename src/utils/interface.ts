import BotClient from '../BotClient'

declare module 'discord.js' {
  export type Tconfig = {
    ownerID: string | string[]
    token: string
  }
  export type ECommand = 'error' | 'conflict'

  export type Tchannel = 'both' | 'guild' | 'dm'

  export type StringFunction = (message: Message) => string | Promise<string>

  export type StringArrayFunction = (
    message: Message
  ) => string | string[] | Promise<string | string[]>

  export type Tignore =
    | string
    | string[]
    | PermissionString[]
    | StringArrayFunction

  export type Tdetail = {
    desc: string
    usage: string
    args?: string[]
    flags?: string[]
    examples?: string[]
  }

  type Default = (msg: Message) => any | Promise<any>

  export type Argument = {
    match:
      | 'member'
      | 'text'
      | 'number'
      | 'endWord'
      | 'flag'
      | 'role'
      | 'regex'
      | 'channel'
    default: any | Default
    regex?: string | RegExp
    flag?: string[]
  }

  export interface IClient {
    persist: Map<string, any>
    config: Tconfig
    checkOwner(user: UserResolvable | string): boolean
    ready(): Promise<void>
  }
  export interface IWrapper {
    id: string
    filepath?: string
    client: BotClient | null
    handler?: any
  }

  export interface IBotHandler {
    extensions: Set<any>
    modules: Collection<string, any>
    load(filepath: any): Promise<any>
    loadAll(dir: string): Promise<any>
    preload(module: Function | any, filepath: any): any
  }

  export interface ICommandHandler {
    ignoreCooldown: Tignore | undefined
  }

  export interface ICommand extends ICommandHandler {
    alias: string[]
    details: Tdetail
    typing: boolean | undefined
    userPerms: Array<PermissionString> | undefined
    channel: Tchannel | undefined
    cooldown: number | undefined
    ownerOnly: boolean | undefined
    limit: number
    run(msg?: Message): void
  }

  export interface EventString extends ClientEvents {
    commandError: 'commandError'
    cooldown: 'cooldown'
    dataUpdate: 'dataUpdate'
    errorBot: 'errorBot'
  }
  export interface MongoObject {
    guilds: GuildSchema
    logs: LogsSchema
    todo: TodoSchema
  }
  export type LogsSchema = {
    _id: string
    error?: Array<any>
    changes?: Array<any>
  }
  export type GuildSchema = {
    _id: string
    prefix?: string
    owner: string
  }
  export type TodoSchema = {
    _id: string
    type: 'join' | 'leave' | 'react' | 'say'
    values: string
    isCommand?: Boolean
  }

  export default class GenerateError extends Error {
    code: string
    from: string
    reason: string
  }
}
