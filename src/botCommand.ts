import {
  SlashCommandBuilder,
  CommandInteraction,
  SlashCommandSubcommandBuilder,
} from "discord.js";

type SlashCommandBaseBuilder = Omit<
  SlashCommandBuilder,
  "addSubcommand" | "addSubcommandGroup"
>;

export interface BotCommand {
  meta:
    | SlashCommandBuilder
    | SlashCommandSubcommandBuilder
    | SlashCommandBaseBuilder;
  run(interaction: CommandInteraction): Promise<unknown>;
}
