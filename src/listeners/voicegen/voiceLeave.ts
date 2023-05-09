import { BotListener } from "../../botListener.js";

const VoiceLeaveListener: BotListener<"voiceStateUpdate"> = {
  event: "voiceStateUpdate",

  async run(client, oldState, newState) {
    if (oldState.channel === null || newState.channelId === oldState.channelId)
      return;

    const { prisma, logger } = client;
    const dbChannel = await prisma.ephemeralVoiceChannel.findFirst({
      where: {
        guildId: oldState.guild.id,
        channelId: oldState.channel.id,
      },
    });

    if (!dbChannel) return;

    logger.debug("User left ephemeral channel");

    // count users in channel
    const channel = oldState.channel;
    const memberCount = channel.members.size;

    // delete channel if empty
    if (memberCount === 0) {
      logger.debug("Deleting empty ephemeral channel");
      await channel.delete();
      await prisma.ephemeralVoiceChannel.delete({
        where: {
          id: dbChannel.id,
        },
      });
    }
  },
};

export default VoiceLeaveListener;
