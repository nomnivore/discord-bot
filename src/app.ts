import {
  Client,
  ClientOptions,
  Collection,
  GatewayIntentBits,
} from "discord.js";
import * as fs from "fs/promises";
import path from "path";
import * as url from "url";
import { BotCommand } from "./botCommand.js";
import { BotListener } from "./botListener.js";
import { Env } from "./env.js";

export class BotClient extends Client {
  stores = {
    commands: new Collection<string, BotCommand>(),
    listeners: new Collection<string, BotListener<any>>(),
  };

  constructor(
    options: ClientOptions = { intents: [GatewayIntentBits.Guilds] }
  ) {
    super(options);
  }

  async setup() {
    await this.registerListeners();
    await this.registerCommands();
  }

  async registerCommands() {
    const commandsDirUrl = new URL("commands", import.meta.url);
    const commandsDir = url.fileURLToPath(commandsDirUrl);
    // get all js/ts files
    const commandsFiles = (await fs.readdir(commandsDir))
      .map((f) => f.replace(/\.ts$/, ".js"))
      .filter((f) => f.endsWith(".js"));

    for (const file of commandsFiles) {
      const filePath = path.join(commandsDir, file);

      // TODO: properly validate types

      const commandModule = (await import(filePath)) as {
        default: BotCommand;
      };

      const command = commandModule.default;
      this.stores.commands.set(command.meta.name, command);
    }

    console.log(`Registered ${this.stores.commands.size} commands.`);
  }

  async registerListeners() {
    const listnersDirUrl = new URL("listeners", import.meta.url);
    const listenersDir = url.fileURLToPath(listnersDirUrl);

    // get all js/ts files
    const listenersFiles = (await fs.readdir(listenersDir))
      .map((f) => f.replace(/\.ts$/, ".js"))
      .filter((f) => f.endsWith(".js"));

    for (const file of listenersFiles) {
      const filePath = path.join(listenersDir, file);

      const listenerModule = (await import(filePath)) as {
        // TODO: can this be typed better?

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        default: BotListener<any>;
      };

      const listener = listenerModule.default;
      // TODO: listeners store

      const onOrOnce = listener.once
        ? this.once.bind(this)
        : this.on.bind(this);

      onOrOnce(listener.event, async (...args: unknown[]) => {
        try {
          await listener.run(this, ...args);
        } catch (err) {
          console.log(`There was an error while executing listener ${file}:`);
          console.log(err);
        }
      });
    }

    console.log(`Registered ${listenersFiles.length} listeners.`);
  }

  async start() {
    await this.login(Env.DISCORD_API_TOKEN);
  }
}
