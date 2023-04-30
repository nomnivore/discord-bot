import { BotListener } from "../../botListener.js";

const OnReady: BotListener<"ready"> = {
  event: "ready",
  once: true,

  // eslint-disable-next-line @typescript-eslint/require-await
  async run({ logger, prisma }, client) {
    logger.info(`Logged in as ${client.user.tag}!`);

    // update bot Guilds in db
    const guilds = await client.guilds.fetch();
    const guildIds = guilds.map((g) => g.id);
    let guildsUpdated = false;

    const guildsInDb = await prisma.guild.findMany();
    for (const id of guildIds) {
      const guildInDb = guildsInDb.find((g) => g.guildId === id);
      if (guildInDb && guildInDb.active) continue;

      if (guildInDb?.active === false) {
        await prisma.guild.update({
          where: { id: guildInDb.id },
          data: { active: true },
        });
        guildsUpdated = true;
        continue;
      }

      await prisma.guild.create({
        data: {
          guildId: id,
          guildName: guilds.get(id)?.name || "unknown guild",
        },
      });
      guildsUpdated = true;
    }

    if (guildsUpdated) {
      logger.info("Updated guilds in database.");
    }
  },
};

export default OnReady;
