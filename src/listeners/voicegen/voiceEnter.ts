import { ChannelType, OverwriteType } from "discord.js";
import { BotListener } from "../../botListener.js";
const VoiceEnterListener: BotListener<"voiceStateUpdate"> = {
  event: "voiceStateUpdate",
  async run(client, oldState, newState) {
    if (
      newState.channelId === null ||
      newState.channelId === oldState.channelId
    )
      return;

    const { prisma, logger } = client;
    logger.debug("voiceStateUpdate");
    const generator = await prisma.voiceChannelGenerator.findFirst({
      where: {
        channelId: newState.channelId,
      },
    });

    if (!generator) return;

    // find category
    const categoryFromCache = newState.guild?.channels.cache.get(
      generator.categoryId
    );

    const category =
      categoryFromCache?.type === ChannelType.GuildCategory
        ? categoryFromCache
        : newState.channel?.parent;

    if (!category) {
      return logger.error(
        `Could not find category for generator ${generator.id}`
      );
    }

    // get the user that joined the channel
    const member = newState.member;

    if (!member) {
      return logger.error(
        `Could not find member for generator ${generator.id}`
      );
    }

    // create new channel
    const channelName = generator.nameTemplate.replace(
      "%user%",
      newState.member?.displayName ?? "User"
    );
    const newChannel = await newState.guild.channels.create({
      type: ChannelType.GuildVoice,
      name: channelName,
      parent: category,
      // TODO: give member ownership of channel
      permissionOverwrites: [
        {
          id: member.id,
          allow: ["ManageChannels"],
          type: OverwriteType.Member,
        },
      ],
    });

    // move member to new channel
    await member.voice.setChannel(newChannel);
  },
};

export default VoiceEnterListener;
