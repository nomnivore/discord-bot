import { BotCommand } from "../../botCommand.js";
import { Env } from "../../env.js";
import { SlashCommandBuilder } from "discord.js";
import isOwner from "../../middleware/isOwner.js";

const StatusCommand: BotCommand = {
  meta: new SlashCommandBuilder()
    .setName("status")
    .setDescription("Set the bot's status")
    .addStringOption((opt) =>
      opt.setName("text").setDescription("The status to set").setRequired(true)
    ),

  middleware: [isOwner()],

  async run(_, interaction) {
    if (interaction.user.id !== Env.DISCORD_BOT_OWNER_ID) {
      await interaction.reply({
        content: "You are not authorized to use this command.",
        ephemeral: true,
      });
    }

    const text = interaction.options.getString("text");

    if (!text) {
      return await interaction.reply({
        content: "You must provide a status to set.",
        ephemeral: true,
      });
    }

    interaction.client.user.setActivity({ name: text });
    return await interaction.reply({
      content: `Set status to ${text}`,
      ephemeral: true,
    });
  },
};

export default StatusCommand;
