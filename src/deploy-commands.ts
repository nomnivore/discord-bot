import { REST, Routes } from "discord.js";
import { Env } from "./env.js";
import * as fs from "fs/promises";
import path from "path";

import { BotClient } from "./index.js";

const client = new BotClient({ intents: [] });

await client.registerCommands();

const cmdJson = client.commands.map((c) => c.meta.toJSON());

const rest = new REST().setToken(Env.DISCORD_API_TOKEN);

// deploy commands
try {
  console.log(`Started refreshing ${cmdJson.length} application (/) commands.`);

  const data = await rest.put(
    Routes.applicationGuildCommands(
      Env.DISCORD_CLIENT_ID,
      Env.DISCORD_DEV_GUILD_ID
    ),
    { body: cmdJson }
  );
  if (data != null && typeof data == "object" && "length" in data) {
    console.log(
      `Successfully reloaded ${data.length as number} application (/) commands.`
    );
  }
} catch (error) {
  console.error(error);
}
