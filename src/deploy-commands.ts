import { REST, Routes } from "discord.js";
import { Env } from "./env.js";

import { BotClient } from "./app.js";

const client = new BotClient({ intents: [] });

await client.registerCommands();

const cmdJson = client.stores.commands.map((c) => c.meta.toJSON());

const rest = new REST().setToken(Env.DISCORD_API_TOKEN);

const { logger } = client;

// deploy commands
try {
  logger.info(`Started refreshing ${cmdJson.length} application (/) commands.`);

  const data = await rest.put(
    Routes.applicationGuildCommands(
      Env.DISCORD_CLIENT_ID,
      Env.DISCORD_DEV_GUILD_ID
    ),
    { body: cmdJson }
  );
  if (data != null && typeof data == "object" && "length" in data) {
    logger.info(
      `Successfully reloaded ${data.length as number} application (/) commands.`
    );
  }
} catch (error) {
  logger.error(error);
}
