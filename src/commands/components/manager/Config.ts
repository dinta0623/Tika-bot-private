import { Message } from 'discord.js'
import Command from '../..'

export default class Config extends Command {
  constructor() {
    super('config', {
      alias: ['config'],
      limit: 1,
      cooldown: 10000,
      userPerms: ['ADMINISTRATOR'],
      details: {
        desc: 'Bot Configurations',
        usage: '<prefix> [aliases] {flags}',
        examples: ['w/config prefix !', '@bot prefix ?'],
        args: ['flags'],
        flags: ['prefix'],
      },
    })
  }
  async run(msg: Message): Promise<void> {
    const [flags, args] = await this.resolveArgue(
      [
        {
          match: 'flag',
          flag: ['prefix'],
          default: undefined,
        },
        {
          match: 'text',
          default: undefined,
        },
      ],
      msg
    )
    const embed = {
      description: `Successfully changed prefix`,
      color: this.ColorUser(msg, msg.author),
      timestamp: new Date(),
      footer: {
        text: `action by ${msg.author.tag}`,
      },
    }
    try {
      if (flags && flags === 'prefix' && args) {
        this.client?.db
          .setOne(
            'guilds',
            { _id: msg.guild?.id },
            {
              $set: {
                prefix: args,
              },
            }
          )
          .then(() =>
            msg.channel.send({
              content: 'done',
              embed,
            })
          )
      } else {
        msg.content = `${this.client?.persist.get(msg.guild!.id).prefix}help ${
          this.id
        }`
        this.client?.emit('message', msg)
      }
    } catch (message) {
      this.client?.emit(
        'errorBot',
        new Error(
          JSON.stringify({
            name: 'bot_config',
            author: msg.author.tag,
            guild: msg.guild?.id,
            code: new Date().getMilliseconds(),
            from: process.cwd(),
            message,
          })
        ),
        msg.guild?.id
      )
    }
  }
}
