import { BotListener } from "../../botListener.js";

const GuildUpdate: BotListener<"guildUpdate"> = {
  event: "guildUpdate",

  async run(client, oldGuild, newGuild) {
    const { prisma, logger } = client;

    if (oldGuild.name !== newGuild.name) {
      await prisma.guild.update({
        where: { guildId: newGuild.id },
        data: { guildName: newGuild.name },
      });

      logger.debug(
        `Guild ${newGuild.id} changed its name from ${oldGuild.name} to ${newGuild.name}.`
      );
    }
  },
};

export default GuildUpdate;
