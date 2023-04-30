import { BotListener } from "../../botListener.js";

const GuildLeave: BotListener<"guildDelete"> = {
  event: "guildDelete",
  async run(client, guild) {
    const { prisma, logger } = client;

    await prisma.guild.update({
      where: { guildId: guild.id },
      data: { active: false },
    });

    logger.info(`Left guild ${guild.name} (${guild.id}).`);
  },
};

export default GuildLeave;
