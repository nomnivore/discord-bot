import { InteractionReplyOptions } from "discord.js";
import { BotListener } from "../botListener.js";

const SlashCommands: BotListener<"interactionCreate"> = {
  event: "interactionCreate",

  async run(client, interaction) {
    // respond to slash commands
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) {
      console.log(`Unknown command: ${interaction.commandName}`);
      return;
    }

    try {
      await command.run(interaction);
    } catch (err) {
      console.log(err);
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
