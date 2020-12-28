import { EventString } from 'discord.js'
import { EventEmitter } from 'events'
import BotWrapper from '../BotWrapper'

export default abstract class Event extends BotWrapper {
  public emitter: string | EventEmitter
  public event: keyof EventString
  public type: string
  constructor(
    id: string,
    {
      emitter,
      event,
      type = 'on',
    }: {
      emitter: string | EventEmitter
      event: keyof EventString
      type?: 'on' | 'once'
    }
  ) {
    super(id)
    this.emitter = emitter
    this.event = event
    this.type = type
  }
  abstract run(...args: any): void
}
