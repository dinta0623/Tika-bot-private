import { Message } from 'discord.js'
import Command from '..'

export default class Avatar extends Command {
  constructor() {
    super('avatar', {
      alias: ['avatar', 'av'],
      limit: 1,
      cooldown: 5000,
      channel: 'both',
      //ownerOnly: true,
      details: {
        desc: 'Showing avatar of author or selected member',
        usage: '<prefix> [aliases] {member} - optional',
        args: ['member'],
        examples: ['w/av @tika#3313', '@bot avatar', 'w/avatar'],
      },
      typing: true,
    })
  }
  async run(msg: Message): Promise<void> {
    const message = await msg.channel.send(`Generating avatar...`)
    const [result] = await this.resolveArgue(
      [
        {
          match: 'member',
          default: (message: Message) => message.member,
        },
      ],
      msg
    )
    msg.channel.send({
      embed: this.NewEmbed()
        .setTitle(`${result.user.tag} avatar`)
        .setColor(this.ColorUser(msg, result.user))
        .setURL(result.user.avatarURL({ dynamic: true }) as string)
        .setImage(result.user.displayAvatarURL({ dynamic: true, size: 1024 }))
        .setFooter(`requested by ${msg.author.username}`),
    })
    message.delete()
  }
}
