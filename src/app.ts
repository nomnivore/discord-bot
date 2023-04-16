import {
  Client,
  Events,
  GatewayIntentBits,
  ClientOptions,
  Collection,
} from "discord.js";
import { Env } from "./env.js";
import path from "path";
import { BotCommand } from "./botCommand.js";
import * as fs from "fs/promises";
import * as url from "url";
import { BotListener } from "./botListener.js";

type BotCommandConstructor = new () => BotCommand;

export class BotClient extends Client {
  commands = new Collection<string, BotCommand>();

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
        default: BotCommandConstructor;
      };

      const command = new commandModule.default();
      this.commands.set(command.meta.name, command);
    }

    console.log(`Registered ${this.commands.size} commands.`);
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

      // TODO: properly validate types

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
  }

  async start() {
    await this.login(Env.DISCORD_API_TOKEN);
  }
}
