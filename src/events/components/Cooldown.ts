import { Message } from 'discord.js'
import Event from '../'
export default class Ready extends Event {
  constructor() {
    super('cooldown', {
      emitter: 'commandHandler',
      event: 'cooldown',
    })
  }
  run(msg: Message, ...args: any): void {
    const [command, time, uses] = args
    msg.delete()
    msg
      .reply(
        `${command.id} command was cooldown for ${new Date(
          time
        ).getSeconds()} seconds`
      )
      .then((e: any) => e.delete({ timeout: 5000 }))
  }
}
