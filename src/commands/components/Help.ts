import { Message } from 'discord.js'
import Command from '..'

export default class Help extends Command {
  constructor() {
    super('help', {
      alias: ['help'],
      details: {
        desc: 'Commands Helper, call it when needed',
        usage: '<prefix> [aliases] {command_name} - optional',
        args: ['command_name'],
        examples: ['w/help ping', '@bot help'],
      },
      limit: 5,
      cooldown: 10000,
      channel: 'both',
    })
  }
  async run(msg: Message, help: any, content: string): Promise<any> {
    try {
      let cmd = help.get(content) as Command | undefined
      cmd = (cmd && !cmd.ownerOnly && cmd) || undefined
      cmd
        ? await msg.channel.send(
            this.NewEmbed()
              .setTitle(`${cmd.id} command`)
              .setColor('#ecf0f1')
              .setDescription(`>>> ${cmd.details.desc}`)
              .addFields(
                {
                  name: `uses`,
                  value: `\`${cmd.limit}\``,
                  inline: true,
                },
                {
                  name: `cooldown`,
                  value: `\`${new Date(
                    cmd.cooldown || 3000
                  ).getSeconds()} seconds\``,
                  inline: true,
                },
                {
                  name: `usage`,
                  value: `\`${cmd.details.usage}\``,
                },
                {
                  name: `permissions`,
                  value: `\`${cmd.userPerms || 'EVERYONE'}\``,
                },
                {
                  name: `aliases`,
                  value: `${cmd.alias.map((e) => ` \`${e}\``)}`,
                },
                {
                  name: `arguments`,
                  value: `${
                    cmd.details.args?.map((e) => ` \`${e}\``) || 'none'
                  }`,
                },
                {
                  name: `flags`,
                  value: `${
                    cmd.details.flags?.map((e) => ` \`${e}\``) || 'none'
                  }`,
                },
                {
                  name: `examples`,
                  value: `${
                    cmd.details.examples
                      ?.map((e) => `-> \`${e}\`\n`)
                      .join(' ') || 'none'
                  }`,
                }
              )
              .setFooter(`requested by ${msg.author.username}`)
          )
        : await msg.channel.send(
            this.NewEmbed()
              .setTitle(`Command List`)
              .setColor('#ecf0f1')
              .setDescription(
                `>>> you're currently at ${
                  msg.guild?.name
                } guild\nglobal prefix : \` w/ \`\n-> prefix on this guild : \` ${
                  this.client?.persist.get(msg.guild!.id).prefix
                } \`\n--> use \` <prefix> help {command} \`   instead`
              )
              .addField(
                'commands',
                Array(
                  help
                    .filter((e: any) => !e.ownerOnly)
                    .map((e: any) => `\t\`${e.id}\``)
                ).join(' '),
                true
              )
              .setFooter(`requested by ${msg.author.username}`)
          )
    } catch (error) {
      msg.channel.send({
        content: msg.author,
        embed: {
          description: String(error),
          color: `RED`,
        },
      })
    }
  }
}
