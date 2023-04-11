import { SlashCommandBuilder, CommandInteraction } from "discord.js";

export abstract class BotCommand {
  abstract meta: SlashCommandBuilder;
  abstract run(interaction: CommandInteraction): Promise<unknown>;
}
