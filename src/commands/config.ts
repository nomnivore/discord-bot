import { BotCommand } from "../botCommand.js";
import { SlashCommandBuilder } from "discord.js";

const config = {
  prefix: "!",
  adminRole: "Admin",
  modRole: "Moderator",
};

const configChoices = Object.keys(config).map((key) => {
  return { name: key, value: key };
});

// This command is a WIP, just here to demonstrate how to use subcommands for now.
const ConfigCommand: BotCommand = {
  meta: new SlashCommandBuilder()
    .setName("config")
    .setDescription("Configure the bot's settings")
    .addSubcommand((sub) =>
      sub
        .setName("get")
        .setDescription("Get the current value of a setting")
        .addStringOption((opt) =>
          opt
            .setName("setting")
            .setDescription("The setting to get")
            .setRequired(true)
            .setChoices(...configChoices)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("set")
        .setDescription("Set the value of a setting")
        .addStringOption((opt) =>
          opt
            .setName("setting")
            .setDescription("The setting to set")
            .setRequired(true)
            .setChoices(...configChoices)
        )
    ),

  async run(client, interaction) {
    if (!interaction.isChatInputCommand()) return;
    const subcommand = interaction.options.getSubcommand();
    client.logger.debug(subcommand);

    await interaction.reply({
      content: "Not yet implemented",
      ephemeral: true,
    });
  },
};

export default ConfigCommand;
