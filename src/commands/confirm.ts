import {
  ComponentType,
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} from "discord.js";
import { BotCommand } from "../botCommand.js";

const command: BotCommand = {
  meta: new SlashCommandBuilder()
    .setName("confirm")
    .setDescription("Confirm a command (proof of concept)"),

  async run(interaction) {
    const { confirmButton, cancelButton } = createUI();

    const confirmMsg = await interaction.reply({
      content: "Please confirm this action",
      ephemeral: true,
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          confirmButton,
          cancelButton
        ),
      ],
    });

    try {
      const x = await confirmMsg.awaitMessageComponent({
        componentType: ComponentType.Button,
        time: 15000,
        filter: (i) => i.user.id === interaction.user.id && i.isButton(),
      });

      if (x.customId === "confirm") {
        await interaction.editReply({
          content: "Confirmed!",
          components: [],
        });
      }

      if (x.customId === "cancel") {
        await interaction.editReply({ content: "Cancelled.", components: [] });
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message.endsWith("time")) {
        await interaction.editReply({
          content: "Cancelled: Timed out.",
          components: [],
        });
      }
    }
  },
};

function createUI() {
  const confirmButton = new ButtonBuilder()
    .setLabel("Confirm")
    .setCustomId("confirm")
    .setStyle(ButtonStyle.Success)
    .setEmoji("✅");

  const cancelButton = new ButtonBuilder()
    .setLabel("Cancel")
    .setCustomId("cancel")
    .setStyle(ButtonStyle.Secondary)
    .setEmoji("❌");

  return {
    confirmButton,
    cancelButton,
  };
}

export default command;
