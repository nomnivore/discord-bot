import { BotListener } from "../../botListener.js";

const OnReady: BotListener<"ready"> = {
  event: "ready",
  once: true,

  // eslint-disable-next-line @typescript-eslint/require-await
  async run(_, client) {
    console.log(`Logged in as ${client.user.tag}!`);
  },
};

export default OnReady;
