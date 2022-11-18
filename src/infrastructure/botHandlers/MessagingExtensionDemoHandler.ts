import { CardFactory, MessagingExtensionAction, MessagingExtensionActionResponse, TurnContext } from "botbuilder";
import { IDependencies } from "../BotActivityHandler";
import { helpCard } from "../cards/helpCard";
import { UserProcessor } from "../UserProcessor";
import { CommandHandler } from "./CommandHandler";

export class MessagingExtensionHandler {

  constructor(private deps: IDependencies, private commandHandler: CommandHandler) { }

  async showMessageExtension(
    context: TurnContext,
    action: MessagingExtensionAction
  ): Promise<MessagingExtensionActionResponse> {
    this.deps.logger.debug(`Received fetch from messaging extension action`);

    let actions: any = {}; // objectCopy will store a copy of the mainObject
    let key;
    for (key in CommandHandler.Actions) {
      actions[key] = CommandHandler.Actions[key]; // copies each property to the objectCopy object
    }
    if (context.activity.from.aadObjectId === process.env.OWNER_AAD_OBJECT_ID) {
      actions[CommandHandler.Snitch] = CommandHandler.Snitch
    }
    return {
      task: {
        type: "continue",
        value: {
          title: "This is the configuration title",
          height: 500,
          width: 500,
          card: CardFactory.adaptiveCard(helpCard(actions, "")),
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
      action
    );

    const command = action.data.text
    await this.commandHandler.handleCommand(command, context)

    return {};
  }
}