import { ChatInputCommandInteraction } from "discord.js";
import { BotClient } from "./app.js";

export type MiddlewareStackNextFunction = () => Promise<unknown>;

export type MiddlewareFunction = (
  client: BotClient,
  interaction: ChatInputCommandInteraction,
  next: MiddlewareStackNextFunction
) => Promise<unknown>;

export type MiddlewareFunctionFactory = () => MiddlewareFunction;
