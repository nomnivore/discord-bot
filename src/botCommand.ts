import { SlashCommandBuilder, CommandInteraction } from "discord.js";

export interface BotCommand {
  meta: SlashCommandBuilder;
  run(interaction: CommandInteraction): Promise<unknown>;
}
