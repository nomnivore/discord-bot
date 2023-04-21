import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import { BotCommand } from "@/botCommand.js";

const command: BotCommand = {
  meta: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!"),

  async run(interaction: CommandInteraction) {
    const msg = await interaction.reply("Pong!");

    const diff = msg.createdTimestamp - interaction.createdTimestamp;
    const ping = Math.round(interaction.client.ws.ping);

    return interaction.editReply(
      `Pong! ✅ (Roundtrip: ${diff}ms | Heartbeat: ${ping}ms)`
    );
  },
};

export default command;
