import { Message } from 'discord.js'
import Event from '../../index'

export default class Ready extends Event {
  constructor() {
    super('ready', {
      emitter: 'client',
      event: 'ready',
    })
  }
  async run(msg: Message): Promise<void> {
    setInterval(async () => {
      const status = [
        `on ${await this.client?.shard
          ?.broadcastEval('this.guilds.cache.size')
          .then((r) =>
            r.reduce((acc, guildCount) => acc + guildCount, 0)
          )} guilds`,
        `with ${await this.client?.shard
          ?.broadcastEval(
            'this.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)'
          )
          .then((r) =>
            r.reduce((acc, memberCount) => acc + memberCount, 0)
          )} members`,
      ]
      this.client?.user?.setPresence({
        activity: {
          name: `${status[Math.floor(Math.random() * status.length)]}`,
          type: 'STREAMING',
          url: 'https://www.twitch.tv/animevibesradio',
        },
        status: 'dnd',
      })
    }, 5000)
    console.log('Bot Siap')
  }
}
