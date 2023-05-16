import * as dotenv from "dotenv";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  DISCORD_API_TOKEN: z.string().nonempty(),
  DISCORD_CLIENT_ID: z.string().nonempty(),
  DISCORD_DEV_GUILD_ID: z.string().nonempty(),
  DISCORD_BOT_OWNER_ID: z.string().nonempty(),
});

export type Env = z.infer<typeof envSchema>;

const loadEnv = (): Env => {
  dotenv.config();

  const env = envSchema.parse(process.env);

  Object.freeze(env);

  return env;
};

export const Env = loadEnv();
