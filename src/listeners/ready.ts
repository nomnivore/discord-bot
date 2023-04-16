import { ClientEvents } from "discord.js";
import { BotListener } from "../botListener.js";
import { BotClient } from "../app.js";

export default class extends BotListener {
  event: keyof ClientEvents = "ready";

  // eslint-disable-next-line @typescript-eslint/require-await
  async run(_: BotClient, [c]: ClientEvents["ready"]) {
    console.log(`Logged in as ${c.user.tag}!`);
  }
}
