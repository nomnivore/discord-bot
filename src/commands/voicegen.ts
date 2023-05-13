import {
  ChannelType,
  GuildBasedChannel,
  SlashCommandBuilder,
  VoiceChannel,
} from "discord.js";
import { BotCommand, SlashCommandFunction } from "../botCommand.js";

interface Subcommands {
  create: SlashCommandFunction;
  list: SlashCommandFunction;
  sync: SlashCommandFunction;
  delete: SlashCommandFunction;
}

// TODO: extract logic to a service

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
    )
    .addSubcommand((sub) =>
      sub
        .setName("list")
        .setDescription("List all Voice Channel Generators in this server")
    )
    .addSubcommand((sub) =>
      sub
        .setName("sync")
        .setDescription("Sync all Voice Channel Generators in this server")
    )
    .addSubcommandGroup((group) =>
      group
        .setName("delete")
        .setDescription("Delete a Voice Channel Generator")
        .addSubcommand((sub) =>
          sub
            .setName("all")
            .setDescription(
              "Delete all Voice Channel Generators in this server"
            )
        )
    ),

  async run(client, interaction) {
    if (!interaction.guild) {
      return await interaction.reply({
        content: "This command must be used in a server.",
        ephemeral: true,
      });
    }

    // get user perms
    const member = interaction.guild.members.cache.get(interaction.user.id);
    // check if user has channel management perms
    if (!member?.permissions.has("ManageChannels", true)) {
      return await interaction.reply({
        content: "You do not have permission to use this command.",
        ephemeral: true,
      });
    }
    // determine subcommand and call appropriate function
    const subcommandGroup = interaction.options.getSubcommandGroup();
    if (subcommandGroup === "delete") {
      return await this.delete(client, interaction);
    }

    const subcommand = interaction.options.getSubcommand();
    if (subcommand === "create") {
      return await this.create(client, interaction);
    } else if (subcommand === "list") {
      return await this.list(client, interaction);
    } else if (subcommand === "sync") {
      return await this.sync(client, interaction);
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

  async list(client, interaction) {
    if (!interaction.guild) {
      throw new Error("This command must be used in a server.");
    }

    const { prisma } = client;
    // get list of voicegens from DB

    const generators = await prisma.voiceChannelGenerator.findMany({
      where: {
        guildId: interaction.guild.id,
      },
    });

    if (generators.length === 0) {
      return await interaction.reply({
        content: "There are no Voice Channel Generators in this server.",
      });
    }

    // build embed
    const embed = {
      title: "Voice Channel Generators",
      description:
        "Voice Channel Generators are channels that create new voice channels when you join them.",
      fields: generators.map((gen) => {
        return {
          name: gen.channelId,
          value: `Category: ${gen.categoryId}`,
        };
      }),
    };

    return await interaction.reply({ embeds: [embed] });
  },

  async sync(client, interaction) {
    await interaction.deferReply({ ephemeral: true });
    if (!interaction.guild) {
      throw new Error("This command must be used in a server.");
    }

    const { prisma } = client;
    // get list of voicegens from DB
    const generators = await prisma.voiceChannelGenerator.findMany({
      where: {
        guildId: interaction.guild.id,
      },
    });

    for (const gen of generators) {
      if (!interaction.guild.channels.cache.has(gen.channelId)) {
        // remove from DB
        await prisma.voiceChannelGenerator.delete({
          where: {
            id: gen.id,
          },
        });
      }
    }

    const ephChannels = await prisma.ephemeralVoiceChannel.findMany({
      where: {
        guildId: interaction.guild.id,
      },
    });

    for (const eph of ephChannels) {
      const channel = interaction.guild.channels.cache.get(eph.channelId);
      let shouldDelete = false;
      if (isVoiceChannel(channel)) {
        if (channel.members.size === 0) {
          await interaction.guild.channels.delete(
            channel,
            "Deleted empty ephemeral channel"
          );
          shouldDelete = true;
        }
      } else {
        shouldDelete = true;
      }

      if (shouldDelete) {
        await prisma.ephemeralVoiceChannel.delete({
          where: {
            id: eph.id,
          },
        });
      }
    }

    return await interaction.editReply({
      content: "Synced Voice Channel Generators and Ephemeral Channels.",
    });
  },

  async delete(client, interaction) {
    if (!interaction.guild) {
      throw new Error("This command must be used in a server.");
    }

    const subcommand = interaction.options.getSubcommand();
    const { prisma } = client;

    if (subcommand === "all") {
      const generators = await prisma.voiceChannelGenerator.findMany({
        where: {
          guildId: interaction.guild.id,
        },
      });

      for (const gen of generators) {
        const channel = interaction.guild.channels.cache.get(gen.channelId);
        const category = interaction.guild.channels.cache.get(gen.categoryId);

        if (channel) {
          await interaction.guild.channels.delete(
            channel,
            "Deleted Voice Channel Generator"
          );
        }

        if (category && category.type === ChannelType.GuildCategory) {
          // check if category is empty
          const count = interaction.guild.channels.cache.filter(
            (c) => c.parentId === category.id
          ).size;
          if (count === 0) {
            await interaction.guild.channels.delete(
              category,
              "Deleted empty category"
            );
          }
        }
      }

      await prisma.voiceChannelGenerator.deleteMany({
        where: {
          guildId: interaction.guild.id,
        },
      });
    }

    await interaction.reply({
      content: "Deleted all Voice Channel Generators in this server.",
      ephemeral: true,
    });
  },
};

function isVoiceChannel(
  channel: GuildBasedChannel | undefined
): channel is VoiceChannel {
  return !!channel && channel.type === ChannelType.GuildVoice;
}

export default command;
