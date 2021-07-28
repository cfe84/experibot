import { CardFactory, MessagingExtensionAction, MessagingExtensionActionResponse, TurnContext } from "botbuilder";
import { IDependencies } from "../BotActivityHandler";
import { helpCard } from "../cards/helpCard";
import { CommandHandler } from "./CommandHandler";

export class MessagingExtensionHandler {

  constructor(private deps: IDependencies, private commandHandler: CommandHandler) { }

  async showMessageExtension(
    context: TurnContext,
    action: MessagingExtensionAction
  ): Promise<MessagingExtensionActionResponse> {
    this.deps.logger.debug(`Received fetch from messaging extension action`);
    return {
      task: {
        type: "continue",
        value: {
          title: "This is the configuration title",
          height: 500,
          width: 500,
          card: CardFactory.adaptiveCard(helpCard(CommandHandler.Actions, "")),
        },
      },
    };
  }

  async defaultMessageExtensionSubmitted(
    context: TurnContext,
    action: MessagingExtensionAction
  ): Promise<MessagingExtensionActionResponse> {
    this.deps.logger.debug(`Received messaging extension submit`);
    this.deps.logger.debug(
      `commandId: ${action.commandId}, data: `,
      action.data
    );

    const command = action.data.text
    await this.commandHandler.handleCommand(command, context)

    return {};
  }
}