import {
  SlashCommandBuilder,
  CommandInteraction,
  SlashCommandSubcommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";
import { BotClient } from "./app.js";

type SlashCommandBaseBuilder = Omit<
  SlashCommandBuilder,
  "addSubcommand" | "addSubcommandGroup"
>;

export interface BotCommand {
  meta:
    | SlashCommandBuilder
    | SlashCommandSubcommandsOnlyBuilder
    | SlashCommandBaseBuilder;
  run(client: BotClient, interaction: CommandInteraction): Promise<unknown>;
}
