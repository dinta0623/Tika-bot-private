import Event from '../../index'

export default class DataUpdate extends Event {
  constructor() {
    super('data-update', {
      emitter: 'client',
      event: 'dataUpdate',
    })
  }
  async run(
    guildID: string,
    id: string,
    reason: string,
    author: string
  ): Promise<void> {
    await this.client?.db.setOne(
      'logs',
      { _id: guildID },
      {
        $push: {
          changes: JSON.stringify({
            id,
            author,
            reason,
            type: 'update',
          }),
        },
      },
      {
        upsert: true,
      }
    )
  }
}
