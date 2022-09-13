import { CloudAdapter, ConfigurationBotFrameworkAuthentication, TurnContext } from "botbuilder";
import { BotFrameworkAuthentication } from "botframework-connector";
import { Application, Request, Response } from "express";
import { BotActivityHandler, IDependencies } from "../BotActivityHandler";

export class BotApiHandler {
  private adapter: CloudAdapter
  private botActivityHandler: BotActivityHandler
  constructor(app: Application, private deps: IDependencies) {
    const auth = new ConfigurationBotFrameworkAuthentication({
      MicrosoftAppId: process.env.BotId,
      MicrosoftAppPassword: process.env.BotPassword,
      MicrosoftAppTenantId: process.env.TenantId
    } as any);
    this.adapter = new CloudAdapter(auth);

    this.adapter.onTurnError = async (context, error) => {
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
    deps.botAdapter = this.adapter; // YUK
    this.botActivityHandler = new BotActivityHandler(app, deps);
    app.post("/api/messages", this.handleBotMessages.bind(this))
  }

  handleBotMessages(req: Request, res: Response) {
    try {
      this.adapter.process(req, res, async (context: TurnContext) => {
        this.deps.logger.verbose(`Message: `, JSON.stringify(req.body, null, 2));
        // Process bot activity
        await this.botActivityHandler.run(context);
      });
    } catch (error) {
      this.deps.logger.error(`Failed to process message`, error);
      this.deps.logger.error(`Message was: `, JSON.stringify(req.body, null, 2));
    }
  }
}