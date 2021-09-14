import { BotFrameworkAdapter, TeamsInfo, TurnContext } from "botbuilder";
import { Application, Request, Response } from "express";
import { BotActivityHandler, IDependencies } from "../BotActivityHandler";

export class BotApiHandler {
  private adapter: BotFrameworkAdapter
  private botActivityHandler: BotActivityHandler
  constructor(app: Application, private deps: IDependencies) {
    this.adapter = new BotFrameworkAdapter({
      appId: process.env.BotId,
      appPassword: process.env.BotPassword,
    });

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
    this.botActivityHandler = new BotActivityHandler(deps);
    app.post("/api/messages", this.handleBotMessages.bind(this))
  }

  handleBotMessages(req: Request, res: Response) {
    try {
      this.adapter.processActivity(req, res, async (context: TurnContext) => {
        // logger.debug(`Message: `, JSON.stringify(req.body, null, 2));
        // Process bot activity
        await this.botActivityHandler.run(context);
      });
    } catch (error) {
      this.deps.logger.error(`Failed to process message`, error);
      this.deps.logger.error(`Message was: `, JSON.stringify(req.body, null, 2));
    }
  }
}