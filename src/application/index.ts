import * as express from "express";
import { BotFrameworkAdapter, TurnContext } from "botbuilder";
import { BotActivityHandler } from "../infrastructure/BotActivityHandler";
import { MemoryStore } from "../infrastructure/MemoryStore";
import path = require("path");
import { ConsoleLogger, LogLevel } from "../infrastructure/ConsoleLogger";
import { CodeExchange as CodeExchange } from "../domain/CodeExchange";
import { AADAuthenticator } from "../infrastructure/AADAuthenticator";
import { IdentityManager } from "../domain/IdentityManager";

require("dotenv").config();
if (!process.env.BotId || !process.env.BotPassword) {
  throw Error(`Missing BotId or BotPassword in environment variables`);
}

const adapter = new BotFrameworkAdapter({
  appId: process.env.BotId,
  appPassword: process.env.BotPassword,
});

adapter.onTurnError = async (context, error) => {
  console.error(`\n [onTurnError] unhandled error: ${error}`);

  await context.sendTraceActivity(
    "OnTurnError Trace",
    `${error}`,
    "https://www.botframework.com/schemas/error",
    "TurnError"
  );

  await context.sendActivity("The bot encountered an error or bug.");
  await context.sendActivity(
    "To continue to run this bot, please fix the bot source code."
  );
};

const logger = new ConsoleLogger(
  process.env.LOGLEVEL?.toUpperCase() === "DEBUG"
    ? LogLevel.Debug
    : LogLevel.Log
);
const authenticator = new AADAuthenticator(
  "437426e6-c3c0-4806-8921-76bcdd4493c9",
  "0b0d52e1-edc0-41f2-87cc-5d2ef153e7b0",
  process.env["AADClientSecret"] as string
);
const identityManager = new IdentityManager({ authenticator });

const botActivityHandler = new BotActivityHandler({
  logger,
  identityManager,
});
const server = express();
const port = process.env.port || process.env.PORT || 3978;
server.listen(port, () => console.log(`Listening at http://localhost:${port}`));

const staticContentPath = path.join(__dirname, "static");
logger.debug(`Using static content in `, staticContentPath);
server.use(express.static(staticContentPath));
server.use(express.json());

server.post("/api/completeAuth", (req, res) => {
  const mapping = req.body as CodeExchange;
  identityManager
    .exchangeNonceToIdentityAsync(
      mapping.nonce,
      mapping.code,
      mapping.callbackUrl
    )
    .then((msa) => {
      res.send(msa);
      res.end();
    });
});

// Listen for incoming requests.
server.post("/api/messages", (req, res) => {
  try {
    adapter.processActivity(req, res, async (context: TurnContext) => {
      // logger.debug(`Message: `, JSON.stringify(req.body, null, 2));
      // Process bot activity
      await botActivityHandler.run(context);
    });
  } catch (error) {
    logger.error(`Failed to process message`, error);
    logger.error(`Message was: `, JSON.stringify(req.body, null, 2));
  }
});
