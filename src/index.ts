import { ShardingManager } from 'discord.js'
import { join } from 'path'
import { config } from 'dotenv'
config()
class Sharding extends ShardingManager {
  constructor() {
    super(join(__dirname, 'BotClient.js'), {
      token: process.env.TOKEN,
      totalShards: 'auto',
    })
    this.init()
  }
  init() {
    this.on('shardCreate', (shard: any) =>
      console.log(`Launched shard ${shard.id}`)
    )
  }
  run() {
    this.spawn(this.totalShards, 10000)
  }
}
new Sharding().run()

// import { config } from "dotenv";
// import { Client } from "discord.js";
// import { join, resolve } from "path";
// import { statSync, readdir } from "fs";
// config();

// const client: Client = new Client({
//   partials: ["MESSAGE", "CHANNEL", "REACTION"],
// });
// client.once("ready", () => {
//   console.log("im ready");
// });

// function read(dir: any): string[] {
//   console.log(`ini dir: ${dir}`);
//   const result = [];
//   (function readd(thedir) {
//     const files = readdirSync(thedir);
//     for (const file of files) {
//       const filepath = join(dir, file);
//       if (statSync(filepath).isDirectory()) {
//         readd(filepath);
//       } else {
//         result.push(filepath);
//       }
//     }
//   })(dir);
//   return result;
// }

// function loadAll(dir: string) {
//   const filepaths = read(dir);
//   filepaths.forEach((filepath) => {
//     filepath = resolve(filepath);
//     load(filepath);
//   });
//   return;
// }

// function load(TheModule: any) {
//   const isClass = typeof TheModule === "function";
//   let mod = isClass ? TheModule : require(TheModule).default;
//   mod = new mod();
//   console.log(mod);
//   return mod;
// }
// client.login(process.env.TOKEN);
