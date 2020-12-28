import {
  PermissionString,
  Message,
  ICommand,
  Tdetail,
  Tchannel,
  Tignore,
} from 'discord.js'
import BotWrapper from '../BotWrapper'

/**
 *  base class of all command classes
 */
export default abstract class Command extends BotWrapper implements ICommand {
  alias: string[]
  details: Tdetail
  userPerms: PermissionString[] | undefined
  channel: 'both' | 'guild' | 'dm' | undefined
  cooldown: number | undefined
  ownerOnly: boolean | undefined
  ignoreCooldown: Tignore | undefined
  typing: boolean | undefined
  limit: number
  constructor(
    /**
     * Command Identifier
     * @type {string} - must be unique
     */
    id: string,
    /**
     * Command Options
     * @type {Object}
     */
    options: {
      alias: string[]
      details: Tdetail
      typing?: boolean
      ownerOnly?: boolean
      userPerms?: PermissionString[]
      channel?: Tchannel
      cooldown?: number
      limit?: number
      ignoreCooldown?: Tignore
    }
  ) {
    super(id)
    this.alias = options.alias
    this.details = options.details
    this.userPerms = options.userPerms
    this.cooldown = options.cooldown

    this.channel = options.channel || 'guild'
    this.limit = options.limit || 2
    this.ownerOnly = Boolean(options.ownerOnly || false)
    this.typing = Boolean(options.typing || false)
    this.ignoreCooldown =
      typeof options.ignoreCooldown === 'function'
        ? options.ignoreCooldown.bind(this)
        : options.ignoreCooldown
  }
  /**
   * it will prevent if result is false
   * @returns {boolean} boolean | true
   */
  prerun(msg?: Message): boolean {
    return true
  }
  /**
   *  it will trigger when command called
   * @param msg {Message} -  discord.js message
   * @returns {void} should possible to run asyncronusly
   */
  abstract run(msg: Message, ...args: any): Promise<void>
}
