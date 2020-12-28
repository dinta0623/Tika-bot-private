import { Message } from 'discord.js'
import Command from '../..'

export default class Ban extends Command {
  constructor() {
    super('ban', {
      alias: ['ban'],
      limit: 1,
      cooldown: 10000,
      typing: true,
      userPerms: ['BAN_MEMBERS'],
      channel: 'guild',
      details: {
        desc: 'Ban a member',
        usage: '<prefix> [aliases] (member) {days} {reason}',
        args: ['member', 'days as number[max: 7(days)]', 'reason'],
        examples: [
          'w/ban @Tika',
          "@bot ban Tika#3313 you're sucks",
          'w/ban @kirito 7 oof',
        ],
      },
    })
  }
  async run(msg: Message): Promise<void> {
    let [isSilent, member, days, txt] = await this.resolveArgue(
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
          match: 'number',
          default: () => undefined,
        },
        {
          match: 'text',
          default: () => `something`,
        },
      ],
      msg
    )
    days = days > 7 ? 7 : days
    !member
      ? !isSilent &&
        (
          await msg.reply({
            embed: {
              description:
                ':no_entry: Please put a member, also the days and reason as you want',
              color: `RED`,
            },
          })
        ).delete({ timeout: 5000 })
      : member && member.user.id === msg.author.id
      ? !isSilent &&
        (await msg.reply(`For real you can't do for your self `)).delete({
          timeout: 5000,
        })
      : Promise.all([member.ban({ days, reason: txt })])
          .then(async () => {
            !isSilent &&
              member &&
              msg.channel.send(
                this.NewEmbed()
                  .setDescription(`reason : \`${txt}\``)
                  .setAuthor(
                    `member ${
                      member.user.tag
                    } has been banned from the server for ${
                      days || 'all'
                    } days\n `,
                    member.user.displayAvatarURL({ dynamic: true })
                  )
                  .setColor(this.ColorUser(msg, member.user))
                  .setFooter(`action by ${msg.author.tag}`)
              ) &&
              (await member.createDM())
                .send(
                  `${member.guild?.name} : you've been banned for ${
                    days || 'all'
                  } days, because \`${txt}\``
                )
                .catch(
                  () =>
                    !isSilent &&
                    msg.author
                      .send(
                        `${msg.guild?.name} : i can't sent directly message to \`${member.user.tag}\``
                      )
                      .catch(() => !isSilent && console.log('gagal'))
                )
          })
          .catch((e) => {
            !isSilent &&
              msg.channel.send({
                embed: {
                  description: `reason : \`perms of the member was higher than mine\``,
                  author: {
                    name: `[${e.httpStatus}] ${member.user.tag} can't be banned from this server\n `,
                    icon_url: member.user.displayAvatarURL({ dynamic: true }),
                  },
                  color: this.ColorUser(msg, member.user),
                  footer: {
                    text: `for ${msg.author.tag}`,
                  },
                  timestamp: new Date(),
                },
              })
          })
  }
}
