import { Message } from 'discord.js'
import Event from '../../index'

export default class MessageDelete extends Event {
  constructor() {
    super('msgdelete', {
      emitter: 'client',
      event: 'messageDelete',
    })
  }
  async run(msg: Message): Promise<void> {
    try {
      if (!msg.partial) {
        if (
          msg.content.match(/^[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]?(purge)\s\d+/)
        )
          return
        if (this.client?.persist.has(msg.channel.id)) {
          this.client?.persist.delete(msg.channel.id)
        }
        !this.client?.persist.has(msg.channel.id) &&
          this.client?.persist.set(msg.channel.id, msg)
      }
    } catch (error) {
      console.log(error)
    }
  }
}
