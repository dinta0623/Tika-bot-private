import { Message } from 'discord.js'
import Command from '../..'

export default class Bot extends Command {
  constructor() {
    super('bot', {
      alias: ['bot'],
      limit: 1,
      cooldown: 1000,
      channel: 'both',
      details: {
        desc: 'Bot informations',
        usage: '<prefix> [aliases] {flags}',
        examples: ['w/bot stats', 'w/bot invite'],
        args: ['flags'],
        flags: ['stats', 'invite'],
      },
    })
  }
  async run(msg: Message): Promise<void> {
    const loading = await msg.channel.send('Fetching...')
    const [args] = await this.resolveArgue(
      [
        {
          match: 'flag',
          flag: ['stats', 'invite'],
          default: undefined,
        },
      ],
      msg
    )
    const embed = {
      title: 'Click Here To Invite Me',
      color: `WHITE`,
      url: await this.client?.generateInvite({
        permissions: 'ADMINISTRATOR',
      }),
      description:
        'Click the title to get the link of mine\nLet me join to your server to helps:)',
      thumbnail: {
        url: this.client?.user?.displayAvatarURL({ dynamic: true }),
      },
      timestamp: new Date(),
      footer: {
        text: `requested`,
      },
    }
    try {
      loading.edit({ content: msg.author })
      if (args && args === 'invite') {
        loading.edit({ embed })
      } else {
        msg.id = String(msg.id + 'new')
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
            name: 'bot_info',
            author: msg.author.tag,
            guild: msg.guild?.id,
            code: new Date().getTime(),
            from: process.cwd(),
            message,
          })
        ),
        msg.guild?.id
      )
    }
  }
}
