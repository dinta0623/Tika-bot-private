import { Collection } from 'discord.js'
import Event from '.'
import BotClient from '../BotClient'
import BotHandler from '../BotHandler'

export default class EventHandler extends BotHandler {
  protected emitters: Collection<unknown, unknown>
  constructor(
    client: BotClient,
    {
      dir,
      moduleHandle = Event,
      extensions = ['.js', '.ts'],
    }: {
      dir: string
      moduleHandle?: any
      extensions?: Array<string>
    }
  ) {
    super(client, {
      dir,
      moduleHandle,
      extensions,
    })
    this.emitters = new Collection()
    this.emitters.set('client', this.client)
  }

  async preload(event: Event, filepath: string): Promise<void> {
    super.preload(event, filepath)
    try {
      event.run = event.run.bind(event)
      this.addToEmitter(event.id)
    } catch (error) {
      console.log(error)
    }
  }
  protected checkIsEventEmitter(event: any) {
    return (
      event &&
      typeof event.on === 'function' &&
      typeof event.emit === 'function'
    )
  }
  public setEmitters(emitters: {}) {
    for (const [key, value] of Object.entries(emitters)) {
      if (!this.checkIsEventEmitter(value)) throw new Error('event invalid')
      this.emitters.set(key, value)
    }
    return this
  }

  protected addToEmitter(id: string) {
    const TheEvent: any = this.modules.get(id.toString())
    if (!TheEvent) throw new Error('event ga ada')
    const emitter = this.checkIsEventEmitter(TheEvent)
      ? TheEvent.emitter
      : this.emitters.get(TheEvent.emitter)
    if (!this.checkIsEventEmitter(emitter)) throw new Error('emitter ga ada')

    if (TheEvent.type === 'once') {
      emitter.once(TheEvent.event, TheEvent.run)
      return TheEvent
    }
    emitter.on(TheEvent.event, TheEvent.run)
    return TheEvent
  }
}
