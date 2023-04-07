import { Client, Events, GatewayIntentBits } from "discord.js";
import { Env } from "./env.js";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

await client.login(Env.DISCORD_API_TOKEN);
