import { SlashCommandBuilder } from "discord.js";
import { BotCommand } from "@/botCommand.js";
import { z } from "zod";

const command = {
  meta: new SlashCommandBuilder()
    .setName("choose")
    .setDescription("Choose between two options")
    .addStringOption((option) =>
      option.setName("option1").setRequired(true).setDescription("First option")
    )
    .addStringOption((option) =>
      option
        .setName("option2")
        .setRequired(true)
        .setDescription("Second option")
    ),

  async run(_, interaction) {
    const options = z
      .object({
        option1: z.string().nonempty(),
        option2: z.string().nonempty(),
      })
      .parse({
        option1: interaction.options.get("option1", true).value,
        option2: interaction.options.get("option2", true).value,
      });

    const random = Math.floor(Math.random() * 2);

    const result = random === 0 ? options.option1 : options.option2;

    await interaction.reply({
      content: `I choose: ${result}!`,
    });
  },
} satisfies BotCommand;

export default command;
