import { Message } from 'discord.js'
import Command from '..'

export default class Sneak extends Command {
  constructor() {
    super('sneak', {
      alias: ['sneak', 's'],
      details: {
        desc: 'Sniping channels ~sssttt',
        usage: '<prefix> [aliases]',
        examples: ['w/sneak', '@bot s'],
      },
      limit: 3,
    })
  }
  async run(msg: Message): Promise<void> {
    const check: Message = this.client?.persist.get(msg.channel.id)
    const image = check && check.attachments.first()
    try {
      if (!check || (check && !check.content && !image)) {
        ;(await msg.reply('There is nothing to do')).delete({
          timeout: 5000,
        })
      } else {
        msg.channel.send(
          this.NewEmbed()
            .setAuthor(
              check.author.username,
              check.author.displayAvatarURL({ dynamic: true })
            )
            .setImage(
              (image?.proxyURL as string) || (image?.attachment as string)
            )
            .setDescription(check.content || check.cleanContent)
            .setColor(this.ColorUser(msg, msg.author))
        )
      }
    } catch (message) {
      this.client!.emit(
        'errorBot',
        new Error(
          JSON.stringify({
            name: 'sneak-command',
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
