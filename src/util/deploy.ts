import crypto from "crypto";
import { REST, Routes } from "discord.js";
import { Env } from "../env.js";
import { BotClient } from "../app.js";

class DeployCommands {
  private client: BotClient;
  private rest: REST;

  constructor(client: BotClient) {
    this.client = client;

    this.rest = new REST().setToken(Env.DISCORD_API_TOKEN);
  }

  async deploy() {
    const { logger, prisma } = this.client;
    const guildId = Env.DISCORD_DEV_GUILD_ID;
    logger.info(`Deploying commands to: ${guildId}`);
    // ensure commands are actually loaded to the bot
    if (!this.commandsLoaded()) {
      logger.error("Error while deploying: Commands not loaded");
      return;
    }
    // fetch last deployment hash from db
    const lastHashModel = await this.getLastHash();
    const lastHash = lastHashModel?.hash ?? null;
    // compute json and hash
    const cmdJson = this.createCmdJson();
    const cmdHash = this.createHash(cmdJson);
    if (lastHash) {
      logger.debug(`Last hash: ${lastHash}`);
      logger.debug(`New hash:  ${cmdHash}`);
    }
    // if hash is the same, return early
    if (lastHash === cmdHash) {
      logger.info("No changes detected, skipping deployment");
      return;
    }
    // if hash is different, deploy
    try {
      logger.info(`Publishing ${cmdJson.length} application (/) commands...`);

      const data = await this.rest.put(
        Routes.applicationGuildCommands(Env.DISCORD_CLIENT_ID, guildId),
        { body: cmdJson }
      );
      if (data != null && typeof data == "object" && "length" in data) {
        logger.info(
          `Successfully published ${
            data.length as number
          } application (/) commands.`
        );
      }
    } catch (error) {
      logger.error(error);
    }
    // save hash to db
    await prisma.lastDeploy.upsert({
      where: {
        guildId: guildId,
      },
      update: {
        hash: cmdHash,
      },
      create: {
        guildId: guildId,
        hash: cmdHash,
      },
    });
  }

  private commandsLoaded() {
    return this.client.stores.commands.size > 0;
  }

  private async getLastHash() {
    const { prisma } = this.client;
    const lastDeploy = await prisma.lastDeploy.findUnique({
      where: {
        guildId: Env.DISCORD_DEV_GUILD_ID,
      },
    });

    return lastDeploy;
  }

  private createCmdJson() {
    return this.client.stores.commands.map((c) => c.meta.toJSON());
  }

  private createHash(data: unknown) {
    const hash = crypto.createHash("md5");
    hash.update(JSON.stringify(data));

    return hash.digest("hex");
  }
}

export { DeployCommands };
