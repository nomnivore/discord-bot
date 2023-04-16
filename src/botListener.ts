import { ClientEvents, Events } from "discord.js";
import { BotClient } from "./app.js";

type EventArguments<T extends keyof ClientEvents> = ClientEvents[T];

export interface BotListener<E extends keyof ClientEvents> {
  event: E;
  once?: boolean;

  run(client: BotClient, ...args: EventArguments<E>): Promise<unknown>;
}
