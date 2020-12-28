import Event from '../../index'

export default class Error extends Event {
  constructor() {
    super('error', {
      emitter: 'client',
      event: 'errorBot',
    })
  }
  async run(error: Error, guildID: any): Promise<void> {
    return
    await this.client?.db.setOne(
      'logs',
      { _id: guildID },
      {
        $push: {
          error,
        },
      },
      {
        upsert: true,
      }
    )
  }
}
