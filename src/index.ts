import { BotClient } from "./app.js";

const client = new BotClient();

await client.setup();
await client.start();
