import { Guild } from 'discord.js'
import Event from '../../index'

export default class GuildJoin extends Event {
  constructor() {
    super('guild_join', {
      emitter: 'client',
      event: 'guildCreate',
    })
  }
  async run(guild: Guild): Promise<void> {
    Promise.all([
      !(await this.client!.db.has('guilds', { _id: guild.id })) &&
        (await this.client!.db.add(
          'guilds',
          {
            _id: guild.id,
            owner: guild.ownerID,
          },
          { timestamps: true }
        )),
    ])
      .then(() =>
        this.client!.emit(
          'dataUpdate', // event
          guild.id, // guild
          new Date().getTime(), // code
          'joined a guild', // reason
          'bot' // author
        )
      )
      .catch((message) =>
        this.client!.emit(
          'errorBot',
          new Error(
            JSON.stringify({
              name: 'guild-join-event',
              author: 'bot',
              code: new Date().getTime(),
              from: process.cwd(),
              message,
            })
          )
        )
      )
  }
}
