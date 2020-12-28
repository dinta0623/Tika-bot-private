import { MessageReaction, GuildMember, Role, User, Message } from 'discord.js'
import Command from '../..'

export default class Roles extends Command {
  constructor() {
    super('roles', {
      alias: ['roles', 'r'],
      limit: 1,
      cooldown: 10000,
      typing: true,
      userPerms: ['MANAGE_ROLES'],
      details: {
        desc:
          'Manage member roles\n `if you dont put any arguments`, it will showing the guild roles\n`this will also showing` the spesific role by your args except the flags\n`flags can be use` for manage a role',
        usage: '<prefix> [aliases] {member/role} {flags}',
        args: ['member', 'role', 'flags'],
        flags: ['add', 'remove', 'set'],
        examples: [
          'w/roles',
          'w/roles @role',
          'w/r @Tika',
          '@bot r Tika#3313',
          'w/r @Tika add @new_role',
          'w/r @Lina remove @old_role',
          'w/roles @Hinata set @old_role @new_role',
        ],
      },
    })
  }
  async paginationExec(
    msg: Message,
    datas: Array<any> | undefined,
    title: string,
    pfp: string
  ) {
    const editable = await msg.channel.send('Checking...')
    const id = Math.floor(100000000 + Math.random() * 900000000)
    const emojis = ['⬅️', '➡️']
    const limit = 30000
    try {
      editable.react(emojis[0]).then(() => {
        const collector = editable.createReactionCollector(
          (reaction: MessageReaction, user: User) =>
            emojis.includes(reaction.emoji.name),
          { time: limit }
        )
        editable.react(emojis[1])
        collector.on(
          'collect',
          async (reaction: MessageReaction, user: User) => {
            const pages = 6
            let index = Number(this.client?.persist.get(`i${id}`) || 0)
            let max = Math.floor(datas!.length / pages)
            await Promise.resolve(
              reaction.emoji.name === emojis[0] ? --index : index++
            )
            index = index < 1 ? 1 : index
            datas!.length % pages > 0 && max++
            index = index > max ? max : index
            this.client?.persist.set(`i${id}`, index)
            const result = this.reSort(datas as [], index, pages)
            !reaction.me && reaction.users.remove(user)
            await editable.edit({
              content: 'done',
              embed: {
                title: `page ${index}/${max}`,
                description: `${result.join('\n')}`,
                color: `RED`,
                author: {
                  name: title,
                  icon_url: pfp,
                },
                footer: {
                  text: `requested by ${msg.author.tag}`,
                },
                timestamp: new Date(),
              },
            })
          }
        )
        collector.on('end', () => this.client?.persist.delete(`i${id}`))
        Promise.all([
          editable.delete({ timeout: limit }),
          msg.delete({ timeout: limit }),
        ])
      })
    } catch (message) {
      this.client!.emit(
        'errorBot',
        new Error(
          JSON.stringify({
            name: 'roles-command',
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

  async run(msg: Message): Promise<void> {
    const [flag, role, member, role2] = await this.resolveArgue(
      [
        {
          match: 'flag',
          flag: ['add', 'remove', 'set'],
          default: false,
        },
        {
          match: 'role',
          default: undefined,
        },
        {
          match: 'member',
          default: undefined,
        },
        {
          match: 'role',
          default: undefined,
        },
      ],
      msg
    )
    try {
      if (!flag && !role && !member) {
        this.paginationExec(
          msg,
          msg.guild!.roles.cache.sort(this.resolveAsc).array(),
          `this server has ${msg.guild?.roles.cache.size} roles`,
          msg.guild?.iconURL({ dynamic: true }) as string
        )
      } else if (flag) {
        if (role && member) {
          try {
            const add = async (
              newRole: Role,
              newMember: GuildMember
            ): Promise<any> =>
              newMember.roles.cache.has(newRole.id)
                ? msg.channel
                    .send({
                      embed: {
                        description: `${newMember.user} already has ${newRole.name} role`,
                        color: `RED`,
                        timestamp: new Date(),
                        footer: {
                          text: `action by ${msg.author.tag}`,
                        },
                      },
                    })
                    .then((e) => e.delete({ timeout: 10000 }))
                : (await newMember.roles.add(newRole).then(async () =>
                    msg.channel.send({
                      embed: {
                        description: `${newRole} has succesfully added to ${newMember.user}`,
                        color: newRole.color,
                        timestamp: new Date(),
                        footer: {
                          text: `action by ${msg.author.tag}`,
                        },
                      },
                    })
                  )) &&
                  Promise.all([newMember.createDM()])
                    .then((e: any) =>
                      e[0].send(
                        `${newMember.guild?.name} : Gave you a role \`${newRole.name}\``
                      )
                    )
                    .catch(async () =>
                      (await msg.author.createDM())
                        .send(
                          `${msg.guild?.name} : i can't send directly message to \`${newMember.user.tag}\``
                        )
                        .catch(() =>
                          this.client!.emit(
                            'errorBot',
                            new Error(
                              JSON.stringify({
                                name: 'roles-command',
                                author: msg.author.tag,
                                guild: msg.guild?.id,
                                code: new Date().getTime(),
                                from: process.cwd(),
                                message: `${msg.author.tag} was blocked dm`,
                              })
                            ),
                            msg.guild?.id
                          )
                        )
                    )
            const remove = async (
              oldRole: Role,
              newMember: GuildMember
            ): Promise<any> =>
              !newMember.roles.cache.has(oldRole.id)
                ? msg.channel
                    .send({
                      embed: {
                        description: `${newMember.user} wasn't has ${oldRole.name} role`,
                        color: `RED`,
                        timestamp: new Date(),
                        footer: {
                          text: `action by ${msg.author.tag}`,
                        },
                      },
                    })
                    .then((e) => e.delete({ timeout: 10000 }))
                : await newMember.roles.remove(oldRole).then(() => {
                    msg.channel.send({
                      embed: {
                        description: `${oldRole} has succesfully removed from ${newMember.user}`,
                        color: oldRole.color,
                        timestamp: new Date(),
                        footer: {
                          text: `action by ${msg.author.tag}`,
                        },
                      },
                    })
                    Promise.all([newMember.createDM()])
                      .then((e: any) =>
                        e[0].send(
                          `${newMember.guild?.name} : Removed \`${oldRole.name}\` from you`
                        )
                      )
                      .catch(async () =>
                        (await msg.author.createDM())
                          .send(
                            `${msg.guild?.name} : i can't send directly message to \`${newMember.user.tag}\``
                          )
                          .catch(() =>
                            this.client!.emit(
                              'errorBot',
                              new Error(
                                JSON.stringify({
                                  name: 'remove-flag-roles',
                                  author: msg.author.tag,
                                  guild: msg.guild?.id,
                                  code: new Date().getTime(),
                                  from: process.cwd(),
                                  message: `${msg.author.tag} was blocked dm`,
                                })
                              ),
                              msg.guild?.id
                            )
                          )
                      )
                  })
            flag === 'add' && (await add(role, member))
            flag === 'remove' && (await remove(role, member))
            if (flag === 'set' && role2) {
              await remove(role, member)
              await add(role2, member)
            } else if (flag === 'set' && !role2) {
              msg.channel
                .send({
                  embed: {
                    description:
                      ':exclamation: need a role after the member args to run with the flag',
                    color: `RED`,
                  },
                })
                .then((e) => e.delete({ timeout: 10000 }))
            }
          } catch (error) {
            const result = String(error.path).split(/[/]/)
            msg.channel
              .send({
                embed: {
                  description: `:no_entry: cannot manage ${
                    msg.guild?.roles.resolve(result[result.length - 1])?.name
                  } role, because permissions of mine is doesn't enough `,
                  color: `RED`,
                },
              })
              .then((e) => e.delete({ timeout: 10000 }))
              .catch((message) =>
                this.client!.emit(
                  'errorBot',
                  new Error(
                    JSON.stringify({
                      name: 'flag-roles-command',
                      author: msg.author.tag,
                      guild: msg.guild?.id,
                      code: new Date().getTime(),
                      from: process.cwd(),
                      message,
                    })
                  ),
                  msg.guild?.id
                )
              )
          }
        } else {
          !role &&
            msg.channel.send({
              embed: {
                description:
                  ':exclamation: need a role at first args to run with the flag',
                color: `RED`,
              },
            })
          role &&
            !member &&
            msg.channel.send({
              embed: {
                description:
                  ':exclamation: need a member after role args to run with the flag',
                color: `RED`,
              },
            })
        }
      } else if (role) {
        this.paginationExec(
          msg,
          msg.guild!.roles.resolve(role)!.members.array(),
          `members in ${role.name} was ${role.members.size}`,
          msg.guild?.iconURL({ dynamic: true }) as string
        )
      } else if (member) {
        this.paginationExec(
          msg,
          member.roles.cache.sort(this.resolveAsc).array(),
          `${member.user.tag} has ${member.roles.cache.size} roles`,
          member.user.displayAvatarURL({ dynamic: true }) as string
        )
      } else {
        msg.id = String(msg.id + 'new')
        msg.content = `${
          this.client?.persist.get(msg.guild!.id).prefix
        }help roles`
        this.client?.emit('message', msg)
      }
    } catch (message) {
      this.client!.emit(
        'errorBot',
        new Error(
          JSON.stringify({
            name: 'roles-command',
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
