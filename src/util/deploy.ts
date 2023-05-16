import crypto from "crypto";
import { REST, Routes } from "discord.js";
import { Env } from "../env.js";
import { BotClient } from "../app.js";

class APIDeployer {
  private client: BotClient;
  private rest: REST;

  constructor(client: BotClient) {
    this.client = client;

    this.rest = new REST().setToken(Env.DISCORD_API_TOKEN);
  }

  /**
   * Deploy commands to Discord API.
   * @param guildId - The guild ID to deploy to, or "global" || undefined to deploy globally.
   */
  async deploy(guildId?: string) {
    const { logger, prisma } = this.client;
    const deployId = guildId ?? "global";
    logger.info(`Deploying commands to: ${deployId}`);
    // ensure commands are actually loaded to the bot
    if (!this.commandsLoaded()) {
      logger.error("Error while deploying: Commands not loaded");
      return;
    }
    // fetch last deployment hash from db
    const lastHashModel = await this.getLastHash(deployId);
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

      const data = await this.putData(cmdJson, deployId);
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
        guildId: deployId,
      },
      update: {
        hash: cmdHash,
      },
      create: {
        guildId: deployId,
        hash: cmdHash,
      },
    });
  }

  private async putData(data: unknown, guildId: string) {
    if (guildId !== "global") {
      return await this.rest.put(
        Routes.applicationGuildCommands(Env.DISCORD_CLIENT_ID, guildId),
        { body: data }
      );
    }
    return await this.rest.put(
      Routes.applicationCommands(Env.DISCORD_CLIENT_ID),
      { body: data }
    );
  }

  private commandsLoaded() {
    return this.client.stores.commands.size > 0;
  }

  private async getLastHash(guildId: string) {
    const { prisma } = this.client;
    const lastDeploy = await prisma.lastDeploy.findUnique({
      where: {
        guildId: guildId,
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

export { APIDeployer };
