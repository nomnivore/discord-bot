import { InteractionReplyOptions } from "discord.js";
import { BotListener } from "../../botListener.js";
import { MiddlewareStackNextFunction } from "../../botMiddleware.js";

const SlashCommands: BotListener<"interactionCreate"> = {
  event: "interactionCreate",

  async run(client, interaction) {
    const { logger } = client;
    // respond to slash commands
    if (!interaction.isChatInputCommand()) return;

    const command = client.stores.commands.get(interaction.commandName);
    if (!command) {
      logger.warn(`Unknown command: ${interaction.commandName}`);
      return;
    }

    try {
      logger.debug(`Executing command: ${command.meta.name}`);

      if (command.middleware) {
        const stack = [...command.middleware].reverse();

        const next: MiddlewareStackNextFunction = async () => {
          const middleware = stack.pop();
          if (middleware) {
            await middleware(client, interaction, next);
          } else {
            await command.run(client, interaction);
          }
        };

        await next();
      } else {
        await command.run(client, interaction);
      }
    } catch (err) {
      logger.error(err);
      const reply: InteractionReplyOptions = {
        content: "There was an error while executing this command!",
        ephemeral: true,
      };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(reply);
      } else {
        await interaction.reply(reply);
      }
    }
  },
};

export default SlashCommands;
