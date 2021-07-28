import * as express from "express";
import * as path from "path";
import { ConsoleLogger, LogLevel } from "../infrastructure/ConsoleLogger";
import { AADAuthenticator } from "../infrastructure/AADAuthenticator";
import { IdentityManager } from "../domain/IdentityManager";
import { AppointmentHandler } from "../infrastructure/apiHandlers/AppointmentHandler";
import { BotApiHandler } from "../infrastructure/apiHandlers/BotApiHandler";
import { IDependencies } from "../infrastructure/BotActivityHandler";
import { LogHandler } from "../infrastructure/apiHandlers/LogHandler";
import { AuthApiHandler } from "../infrastructure/apiHandlers/AuthApiHandler";
import { MemoryStore } from "../infrastructure/MemoryStore";

require("dotenv").config();
if (!process.env.BotId || !process.env.BotPassword) {
  throw Error(`Missing BotId or BotPassword in environment variables`);
}

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
const store = new MemoryStore()

const deps: IDependencies = {
  identityManager,

  logger
}

const server = express();
const port = process.env.port || process.env.PORT || 3978;
server.listen(port, () => console.log(`Listening at http://localhost:${port}`));

const staticContentPaths = [path.join(__dirname, "static"), path.join(__dirname, "scripts")]
staticContentPaths.forEach(staticContentPath => {
  logger.debug(`Using static content in `, staticContentPath);
  server.use(express.static(staticContentPath));
})

server.use(express.json());
server.use(express.text())


new LogHandler(server)
new AppointmentHandler(server, { appointmentStore: store, serviceTypeStore: store })
new BotApiHandler(server, deps)
new AuthApiHandler(server, deps)