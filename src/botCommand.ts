import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";
import { BotClient } from "./app.js";
import { MiddlewareFunction } from "./botMiddleware.js";

type SlashCommandBaseBuilder = Omit<
  SlashCommandBuilder,
  "addSubcommand" | "addSubcommandGroup"
>;

export interface BotCommand {
  meta:
    | SlashCommandBuilder
    | SlashCommandSubcommandsOnlyBuilder
    | SlashCommandBaseBuilder;
  run(
    client: BotClient,
    interaction: ChatInputCommandInteraction
  ): Promise<unknown>;

  // middleware
  // callback function that takes a collection of middleware function factories and returns an array of middleware functions
  middleware?: MiddlewareFunction[];
}
