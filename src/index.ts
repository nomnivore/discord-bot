import { BotClient } from "./app.js";
import { Env } from "./env.js";

const client = new BotClient();

await client.setup();

if (Env.NODE_ENV === "development") {
  await client.deployCommands(Env.DISCORD_DEV_GUILD_ID);
} else if (Env.NODE_ENV === "production") {
  await client.deployCommands(); // global
}

await client.start();
