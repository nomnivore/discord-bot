import { BotListener } from "../../botListener.js";

const GuildJoin: BotListener<"guildCreate"> = {
  event: "guildCreate",
  async run(client, guild) {
    const { prisma, logger } = client;
    // first, check if guild is already in our database
    const guildInDb = await prisma.guild.findUnique({
      where: {
        guildId: guild.id,
      },
    });

    if (guildInDb) {
      // if it is, just update the name and active status
      logger.info(
        `Joined guild ${guild.name} (${guild.id}), but it was already in the database.`
      );
      await prisma.guild.update({
        where: { id: guildInDb.id },
        data: { active: true, guildName: guild.name },
      });

      return;
    }

    // it isn't, so we need to add it
    await prisma.guild.create({
      data: {
        guildId: guild.id,
        guildName: guild.name,
      },
    });

    logger.info(
      `Joined guild ${guild.name} (${guild.id}) and added it to the database.`
    );
  },
};

export default GuildJoin;
