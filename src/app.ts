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

type BotCommandConstructor = new () => BotCommand;

export class BotClient extends Client {
  commands = new Collection<string, BotCommand>();

  constructor(
    options: ClientOptions = { intents: [GatewayIntentBits.Guilds] }
  ) {
    super(options);
  }

  async setup() {
    this.registerListeners();
    await this.registerCommands();
  }

  async registerCommands() {
    const commandsDirUrl = new URL("commands", import.meta.url);
    const commandsDir = url.fileURLToPath(commandsDirUrl);
    console.log(commandsDir);
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

    console.log(this.commands);
  }

  registerListeners() {
    // respond to slash commands
    this.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      const command = this.commands.get(interaction.commandName);
      if (!command) {
        console.log(`Unknown command: ${interaction.commandName}`);
        return;
      }

      try {
        await command.run(interaction);
      } catch (err) {
        console.log(err);
        const reply = {
          content: "There was an error while executing this command!",
          ephemeral: true,
        };
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(reply);
        } else {
          await interaction.reply(reply);
        }
      }
    });
  }

  async start() {
    this.once(Events.ClientReady, (c) => {
      console.log(`Ready! Logged in as ${c.user.tag}`);
    });

    await this.login(Env.DISCORD_API_TOKEN);
  }
}
