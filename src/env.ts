import * as dotenv from "dotenv";
import { z } from "zod";

const envSchema = z.object({
  DISCORD_API_TOKEN: z.string().nonempty(),
});

export type Env = z.infer<typeof envSchema>;

const loadEnv = () => {
  dotenv.config();

  const env = envSchema.parse(process.env);

  Object.freeze(env);

  return env;
};

export const Env = loadEnv();
