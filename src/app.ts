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
import { Logger } from "./util/logger.js";
import { performance } from "perf_hooks";

export class BotClient extends Client {
  stores = {
    commands: new Collection<string, BotCommand>(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listeners: new Collection<string, BotListener<any>>(),
  };

  logger = new Logger(0);

  private isSetup = false;

  constructor(
    options: ClientOptions = { intents: [GatewayIntentBits.Guilds] }
  ) {
    super(options);
  }

  async setup() {
    if (this.isSetup) return;

    // track time for this action
    const startTime = performance.now();

    await this.registerListeners();
    await this.registerCommands();

    this.isSetup = true;

    const endTime = performance.now();
    const time = (endTime - startTime).toFixed(2);
    this.logger.debug(`Setup took ${time}ms.`);
  }

  private async recursiveLoader(
    rootDir: string,
    callback: (filePath: string, folderPath?: string) => Promise<void>,
    folderPath?: string
  ) {
    const dirUrl = new URL(rootDir, import.meta.url);
    const dir = path.join(url.fileURLToPath(dirUrl), folderPath ?? "");

    // get all folders
    const folders: string[] = [];
    for (const item of await fs.readdir(dir)) {
      if ((await fs.stat(path.join(dir, item))).isDirectory()) {
        folders.push(item);
      }
    }
    // recursively act in subfolders
    for (const folder of folders) {
      await this.recursiveLoader(rootDir, callback, folder);
    }
    // get all js/ts files
    const files = (await fs.readdir(dir))
      .map((f) => f.replace(/\.ts$/, ".js"))
      .filter((f) => f.endsWith(".js"));

    for (const file of files) {
      const filePath = path.join(dir, file);

      await callback(filePath, folderPath);
    }
  }

  async registerCommands() {
    await this.recursiveLoader("commands", async (filePath) => {
      // TODO: properly validate types

      const commandModule = (await import(filePath)) as {
        default: BotCommand;
      };

      const command = commandModule.default;
      this.stores.commands.set(command.meta.name, command);
    });

    this.logger.info(`Registered ${this.stores.commands.size} commands.`);
  }

  async registerListeners() {
    await this.recursiveLoader("listeners", async (filePath, folderPath) => {
      const listenerModule = (await import(filePath)) as {
        // TODO: can this be typed better?

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        default: BotListener<any>;
      };

      const listener = listenerModule.default;
      const filename = path.basename(filePath).replace(/\.js$/, "");
      const key = `${listener.event as string}:${
        folderPath ? folderPath + ":" : ""
      }${filename}`;
      this.stores.listeners.set(key, listener);

      const onOrOnce = listener.once
        ? this.once.bind(this)
        : this.on.bind(this);

      onOrOnce(listener.event, async (...args: unknown[]) => {
        try {
          await listener.run(this, ...args);
        } catch (err) {
          this.logger.error(
            `There was an error while executing listener ${key}:`
          );
          this.logger.error(err);
        }
      });
    });

    this.logger.info(`Registered ${this.stores.listeners.size} listeners.`);
  }

  async start() {
    await this.login(Env.DISCORD_API_TOKEN);
  }
}
