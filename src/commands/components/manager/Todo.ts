import { Message } from 'discord.js'
import Command from '../..'

export default class Todo extends Command {
  constructor() {
    super('todo', {
      alias: ['todo'],
      limit: 1,
      cooldown: 30000,
      userPerms: ['ADMINISTRATOR'],
      details: {
        desc:
          'Makes the bot to do something awesome\n`use {member} instead member` in a command\n`! in the front of an id` for mark this as a role(id)\n`prefix &` for mark this as a msg(id)\n`prefix #`, mark this as a channel(id)',
        usage: '<prefix> [aliases] (flags as events) (options by each flag)',
        examples: [
          'w/todo on.join w/roles add &790911248681271297 {member}',
          'w/todo on.react *790911246462877696 w/roles set &790911248681271297 {member} &79091124868127',
          'w/todo on.leave w/say #79091124646280340 have a nice day :(',
          'w/todo on.say hentai, w/warn {member} pls dont',
        ],
        args: ['flags'],
        flags: ['on.join', 'on.react', 'on.say'],
      },
    })
  }
  async run(msg: Message): Promise<void> {
    let [flags, content] = await this.resolveArgue(
      [
        {
          match: 'flag',
          flag: ['on.join', 'on.react', 'on.leave', 'on.say'],
          default: undefined,
        },
        {
          match: 'text',
          default: (msg: Message) => msg.content,
        },
      ],
      msg
    )
    try {
      if (!flags) {
        msg.id = String(msg.id + 'new')
        msg.content = `${this.client?.persist.get(msg.guild!.id).prefix}help ${
          this.id
        }`
        this.client?.emit('message', msg)
        return
      } else {
        String(content)
          .split(/\s+/)
          .forEach((e: string) => {
            const match = e.match(/^(&|!|#)\d{17,18}/g)
            if (match) {
              content =
                match &&
                String(content).replace(
                  match[0],
                  match[0].includes('&') ? `<@${e}>` : `<${e}>`
                )
            }
          })
        let checker
        if (flags === 'on.join') {
          checker = this.client?.db.get('todo', {
            type: { $in: ['on.join', 'on.leave'] },
          })
          console.log(checker?.then((e) => e?.count))
        } else if (flags === 'on.leave') {
        } else if (flags === 'on.react') {
        } else if (flags === 'on.say') {
        }
        await this.client!.db.setOne(
          'todo',
          { values: content },
          {
            $set: {
              guild: msg.guild?.id,
              type: flags,
              values: content,
              author: msg.author,
            },
          },
          { timestamps: true, upsert: true }
        )
        msg.channel.send({
          embed: {
            title: ':white_check_mark: Successfully added',
            color: this.ColorUser(msg, msg.author),
            description: `when ${
              flags.split('.')[1]
            }, run :\n\`\`\`${content}\`\`\``,
            timestamp: new Date(),
            footer: {
              text: `added by ${msg.author.tag}`,
            },
          },
        })
      }
    } catch (message) {
      this.client?.emit(
        'errorBot',
        new Error(
          JSON.stringify({
            name: 'todo-command',
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
