import { Message } from 'discord.js'
import Command from '../..'

export default class Warn extends Command {
  constructor() {
    super('warn', {
      alias: ['warn'],
      limit: 1,
      cooldown: 5000,
      typing: true,
      userPerms: ['MANAGE_MESSAGES', 'MANAGE_NICKNAMES'],
      channel: 'guild',
      details: {
        desc: 'Warn a member',
        usage: '<prefix> [aliases] (member) {reason}',
        args: ['member', 'reason'],
        examples: ['w/warn @Tika', '@bot warn Tika#3313 stop spamming'],
      },
    })
  }
  async run(msg: Message): Promise<void> {
    const [isSilent, member, txt] = await this.resolveArgue(
      [
        {
          match: 'flag',
          flag: ['silent'],
          default: undefined,
        },
        {
          match: 'member',
          default: false,
        },
        {
          match: 'text',
          default: () => `something`,
        },
      ],
      msg
    )
    try {
      !member
        ? !isSilent &&
          (
            await msg.reply({
              embed: {
                description:
                  ':no_entry: Please put a member, also the reason as you want',
                color: `RED`,
              },
            })
          ).delete({ timeout: 5000 })
        : member && member.user.id === msg.author.id
        ? !isSilent &&
          (await msg.reply(`For real you can't do it for your self `)).delete({
            timeout: 5000,
          })
        : !isSilent &&
          msg.channel.send(
            this.NewEmbed()
              .setDescription(`reason : \`${txt}\``)
              .setAuthor(
                `member ${member.user.tag} has been warned from the server\n `,
                member.user.displayAvatarURL({ dynamic: true })
              )
              .setColor(this.ColorUser(msg, member.user))
              .setFooter(`action by ${msg.author.tag}`)
          )
      member &&
        member.user.id !== msg.author.id &&
        (await member.createDM())
          .send(`${member.guild?.name} : you've been warned because \`${txt}\``)
          .catch(() =>
            msg.author
              .send(
                `${msg.guild?.name} : i can't sent directly message to \`${member.user.tag}\``
              )
              .catch(() =>
                this.client!.emit(
                  'error',
                  new Error(
                    JSON.stringify({
                      name: 'guild-join-event',
                      code: new Date().getTime(),
                      from: process.cwd(),
                      message: `${msg.author.tag} was strict him direct messages`,
                    })
                  )
                )
              )
          )
    } catch (message) {
      this.client!.emit(
        'errorBot',
        new Error(
          JSON.stringify({
            name: 'warn-command',
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
