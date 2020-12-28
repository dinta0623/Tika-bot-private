import { Message } from 'discord.js'
import Command from '../..'

export default class Kick extends Command {
  constructor() {
    super('kick', {
      alias: ['kick'],
      limit: 1,
      cooldown: 7000,
      typing: true,
      userPerms: ['KICK_MEMBERS'],
      channel: 'guild',
      details: {
        desc: 'Kick a member',
        usage: '<prefix> [aliases] (member) {reason}',
        args: ['member', 'reason'],
        examples: ['w/kick @Tika', '@bot kick Tika#3313 go away ~'],
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
      : Promise.all([member.kick(txt)])
          .then(async () => {
            !isSilent &&
              member &&
              msg.channel.send(
                this.NewEmbed()
                  .setDescription(`reason : \`${txt}\``)
                  .setAuthor(
                    `member ${member.user.tag} has been kicked from the server\n `,
                    member.user.displayAvatarURL({ dynamic: true })
                  )
                  .setColor(this.ColorUser(msg, member.user))
                  .setFooter(`action by ${msg.author.tag}`)
              ) &&
              (await member.createDM())
                .send(
                  `${member.guild?.name} : you've been kicked because \`${txt}\``
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
                    name: `[${e.httpStatus}] ${member.user.tag} can't be kicked from this server\n `,
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
