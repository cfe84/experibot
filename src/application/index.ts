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
import { NativeAuthApiHandler } from "../infrastructure/apiHandlers/NativeAuthApiHandler";
import { TokenValidator } from "../infrastructure/middleware/TokenValidator";
import { AuthenticationMiddleware } from "../infrastructure/middleware/AuthenticationMiddleware";
import { MineSweeperApiHandler } from "../infrastructure/apiHandlers/MineSweeperApiHandler";

require("dotenv").config();
if (!process.env.BotId || !process.env.BotPassword) {
  throw Error(`Missing BotId or BotPassword in environment variables`);
}
if (!process.env.TenantId) {
  console.warn(`Warning: Missing TenantId in env`);
}
const botId = process.env.BotId;
const tenantId = process.env["TenantId"] || "";


let logLevel = LogLevel.Log

switch (process.env.LOGLEVEL?.toUpperCase()) {
  case "DEBUG":
    logLevel = LogLevel.Debug
    break
  case "VERBOSE":
  case "EXTREME":
    logLevel = LogLevel.Verbose
    break
  case "ERROR":
  case "ERR":
    logLevel = LogLevel.Error
    break
  case "WARNING":
  case "WARN":
    logLevel = LogLevel.Warning
    break
}

const logger = new ConsoleLogger(logLevel);
const authenticator = new AADAuthenticator(
  "437426e6-c3c0-4806-8921-76bcdd4493c9",
  "0b0d52e1-edc0-41f2-87cc-5d2ef153e7b0",
  process.env["AADClientSecret"] as string
);

const identityManager = new IdentityManager({ authenticator });
const store = new MemoryStore()

const tokenValidator = new TokenValidator(tenantId, botId);
const authMiddleware = AuthenticationMiddleware(logger, tokenValidator);

const deps: any = {
  identityManager,
  logger,
  authMiddleware
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
new NativeAuthApiHandler(server, deps)
new MineSweeperApiHandler(server, deps)