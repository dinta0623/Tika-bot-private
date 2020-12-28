import { Message } from 'discord.js'
import Command from '..'

export default class Say extends Command {
  constructor() {
    super('say', {
      alias: ['say'],
      limit: 1,
      cooldown: 30000,
      channel: 'guild',
      details: {
        desc: 'Make the bot to say something',
        usage: '<prefix> [aliases]',
        examples: ['w/say hello!', '@bot sup dude'],
      },
    })
  }
  async run(msg: Message): Promise<void> {
    try {
      msg.content &&
        (await msg.channel.send({
          content: msg.content,
        }))
    } finally {
      msg.content && (await msg.delete())
    }
  }
}
