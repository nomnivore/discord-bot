import { ClientEvents, Events } from "discord.js";
import { BotClient } from "./app.js";

// export type EventCallback<T extends keyof ClientEvents> = (
//   client: BotClient,
//   ...args: ClientEvents[T]
// ) => Promise<unknown>;

export abstract class BotListener {
  // what is the correct type for this?
  abstract readonly event: keyof ClientEvents;
  once?: boolean;

  abstract run(client: BotClient, ...args: unknown[]): Promise<unknown>;
}
