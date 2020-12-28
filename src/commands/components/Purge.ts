import { Message } from 'discord.js'
import Command from '..'

export default class Purge extends Command {
  constructor() {
    super('purge', {
      alias: ['purge'],
      details: {
        desc:
          "Purge messages based on limit [max: 100]\n`make sure` you dont put the limit to 100 up\n`an old message` can`t be deleted if it's older than 14 days",
        usage: '<prefix> [aliases] (limit)',
        args: ['limit'],
        examples: ['w/purge 5', '@bot purge 100'],
      },
      userPerms: ['MANAGE_MESSAGES'],
      cooldown: 15000,
    })
  }
  async run(msg: Message) {
    let [limit] = await this.resolveArgue<number | undefined>(
      [
        {
          match: 'number',
          default: undefined,
        },
      ],
      msg
    )
    !limit &&
      msg.channel
        .send({
          embed: {
            description: ':no_entry: this command needed a value',
            color: `RED`,
          },
        })
        .then((e) => e.delete({ timeout: 5000, reason: 'warn' }))
    try {
      limit++
      limit &&
        (await msg.channel.messages.channel
          .bulkDelete(limit > 100 ? 100 : limit)
          .catch(() => {
            throw new Error(':watch: cannot purge messages older than 14 days')
          }))
    } catch (message) {
      msg.channel.send({
        content: msg.author,
        embed: {
          description: String(message),
          color: `RED`,
        },
      })
      // this.client!.emit(
      //   'errorBot',
      //   new Error(
      //     JSON.stringify({
      //       name: 'purge-command',
      //       author: msg.author.tag,
      //       guild: msg.guild?.id,
      //       code: new Date().getTime(),
      //       from: process.cwd(),
      //       message,
      //     })
      //   ),
      //   msg.guild?.id
      // )
    }
  }
}
