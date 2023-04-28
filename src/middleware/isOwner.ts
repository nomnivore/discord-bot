import { MiddlewareFunction } from "../botMiddleware.js";
import { Env } from "../env.js";

const isOwner = (): MiddlewareFunction => {
  return async (client, interaction, next) => {
    if (interaction.user.id === Env.DISCORD_BOT_OWNER_ID) {
      client.logger.debug("User is owner");
      return await next();
    }

    await interaction.reply({
      content: "You are not authorized to use this command.",
      ephemeral: true,
    });
  };
};

export default isOwner;
