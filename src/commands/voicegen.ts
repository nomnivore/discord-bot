import { ChannelType, SlashCommandBuilder } from "discord.js";
import { BotCommand, SlashCommandFunction } from "../botCommand.js";

interface Subcommands {
  create: SlashCommandFunction;
}

const command: BotCommand & Subcommands = {
  meta: new SlashCommandBuilder()
    .setName("voicegen")
    .setDescription("Create or manage Voice Channel Generators")
    .addSubcommand((sub) =>
      sub
        .setName("create")
        .setDescription("Create a new Voice Channel Generator")
        .addChannelOption((opt) =>
          opt
            .setName("category")
            .setDescription(
              "The category to create the generator in (leave blank to create a new one)"
            )
            .addChannelTypes(ChannelType.GuildCategory)
            .setRequired(false)
        )
    ),

  async run(client, interaction) {
    if (!interaction.guild) {
      return await interaction.reply({
        content: "This command must be used in a server.",
        ephemeral: true,
      });
    }
    // determine subcommand and call appropriate function
    const subcommand = interaction.options.getSubcommand();
    if (subcommand === "create") {
      await this.create(client, interaction);
    }
  },

  async create(client, interaction) {
    const { prisma } = client;
    if (!interaction.guild) {
      throw new Error("This command must be used in a server.");
    }

    const categoryArg = interaction.options.getChannel("category", false, [
      ChannelType.GuildCategory,
    ]);
    const category =
      categoryArg ??
      (await interaction.guild.channels.create({
        type: ChannelType.GuildCategory,
        name: "Voice Channels",
      }));

    const generator = await interaction.guild.channels.create({
      type: ChannelType.GuildVoice,
      name: "➕ New Voice Channel",
      parent: category,
    });

    await prisma.voiceChannelGenerator.create({
      data: {
        guildId: interaction.guild.id,
        categoryId: category.id,
        channelId: generator.id,
      },
    });

    return await interaction.reply({
      content: `Created new Voice Channel Generator in ${category.toString()}\n\nYou can now rename the generator channel to your liking.`,
      ephemeral: true,
    });
  },
};

export default command;
