import { Message } from 'discord.js'
import Command from '..'
import guilds from '../../repositories/mongodb/guilds'

export default class Ping extends Command {
  constructor() {
    super('ping', {
      alias: ['ping'],
      limit: 1,
      cooldown: 1000,
      channel: 'both',
      details: {
        desc: 'Check websocket connection between api',
        usage: '<prefix> [aliases]',
        examples: ['w/ping', '@bot ping'],
      },
    })
  }
  async run(msg: Message): Promise<void> {
    const loading = await msg.channel.send('Checking...')
    try {
      //console.log(this.client?.ws.shards.reduce((a, b) => a + b.ping, 0))
      await loading.edit(`Done =^`)
    } finally {
      loading.edit(`Result: \`${this.client?.ws.ping}ms\``)
    }
  }
}
