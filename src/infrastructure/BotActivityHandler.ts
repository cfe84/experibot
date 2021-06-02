import { v4 as uuidv4 } from "uuid";
import {
  ActivityFactory,
  InvokeResponse,
  MessagingExtensionAction,
  MessagingExtensionActionResponse,
  TaskModuleRequest,
  TaskModuleResponse,
  TurnContext,
} from "botbuilder-core";
import {
  MessageFactory,
  TeamsActivityHandler,
  CardFactory,
  TeamsInfo,
} from "botbuilder";
import {} from "botbuilder-dialogs";
import { IThingStore, Thing } from "../domain";

import * as signinCard from "./cards/signinCard.json";
import { refreshCard } from "./cards/refreshCard";
import { openTaskModuleCard } from "./cards/openTaskModuleCard";
import { messageExtensionActionCard } from "./cards/messageExtensionActionCard";
import { ILogger } from "../domain/ILogger";
import { confirmActionCard } from "./cards/confirmActionCard";
import { helpCard } from "./cards/helpCard";

export interface BotActivityHandlerDependencies {
  thingStore: IThingStore;
  logger: ILogger;
}

const Actions: { [key: string]: string } = {
  HELP: "help",
  SIGNIN: "signin",
  SHOW_TASK_MODULE: "show task module",
  SHOW_BUBBLE: "show bubble",
  SHOW_REFRESH: "show refresh",
};
const INVOKE_REFRESH = "refreshCard";

export class BotActivityHandler extends TeamsActivityHandler {
  constructor(private deps: BotActivityHandlerDependencies) {
    super();
    // Handle messages
    this.onMessage(
      async (context, next) => await this.handleMessagesAsync(context, next)
    );
    // Handle invoke by bot action
    this.onInvokeActivity = (context) => this.handleInvokeAsync(context);
  }

  /**
   * Handles invoke types not currently supported by the teamsActivityHandler,
   * such as the refresh
   * @param context
   * @returns
   */
  async handleInvokeAsync(context: TurnContext): Promise<InvokeResponse> {
    this.deps.logger.debug(`Invoke of type `, context.activity.name);
    this.deps.logger.debug(`From: `, context.activity.from);
    if (context.activity.name === "adaptiveCard/action") {
      return await this.handleAdaptiveCardAction(context);
    }

    return super.onInvokeActivity(context);
  }

  async handleAdaptiveCardAction(
    context: TurnContext
  ): Promise<InvokeResponse> {
    if (context.activity?.value?.action?.verb === INVOKE_REFRESH) {
      this.deps.logger.debug("Refreshing card");
      const member = await TeamsInfo.getMember(
        context,
        context.activity.from.id
      );
      return {
        status: 200,
        body: {
          statusCode: 200,
          type: "application/vnd.microsoft.card.adaptive",
          value: refreshCard(new Date().toISOString(), member.name, [
            context.activity.from.id,
          ]),
        },
      };
    }
    throw Error(
      `Verb not implemented: ${context.activity.value?.action?.verb}`
    );
  }

  async handleTeamsTaskModuleFetch(
    context: TurnContext,
    taskModuleRequest: TaskModuleRequest
  ): Promise<TaskModuleResponse> {
    this.deps.logger.debug("Returning task module");
    this.deps.logger.debug(`From: `, context.activity.from);
    return {
      task: {
        type: "continue",
        value: {
          title: "This is the task module title",
          height: 500,
          width: "medium",
          url: process.env.BaseUrl + "/auth/index.html",
          fallbackUrl: process.env.BaseUrl + "/auth/index.html",
        },
      },
    };
  }

  private async handleMessagesAsync(
    context: TurnContext,
    nextAsync: () => Promise<void>
  ) {
    TurnContext.removeRecipientMention(context.activity);
    if (
      !context.activity.text &&
      (!context.activity.value || !context.activity.value["text"])
    ) {
      this.deps.logger.error(
        `Missing "context.activity.text" property in `,
        context.activity
      );
      return;
    }
    const text = (context.activity.text || context.activity.value["text"])
      .trim()
      .toLowerCase();
    switch (text) {
      case Actions.HELP:
        await this.helpActivityAsync(context, text);
        break;
      case Actions.SIGNIN:
        await this.signInAsync(context);
        break;
      case Actions.SHOW_REFRESH:
        await this.showRefreshCardAsync(context);
        break;
      case Actions.SHOW_TASK_MODULE:
        await this.showTaskModuleAsync(context);
        break;
      case Actions.SHOW_BUBBLE:
        await this.showBubbleAsync(context);
        break;
      default:
        await this.helpActivityAsync(context, text);
    }
    await nextAsync();
  }

  async showBubbleAsync(context: TurnContext) {
    const replyActivity = MessageFactory.text("Hi"); // this could be an adaptive card instead
    const url = encodeURIComponent(process.env.BaseUrl as string);
    replyActivity.channelData = {
      notification: {
        alertInMeeting: true,
        externalResourceUrl: `https://teams.microsoft.com/l/bubble/${process.env.BotId}?url=${url}/bubble&height=300&width=500&title=Bubbleeee&completionBotId=${process.env.BotId}`,
      },
    };
    await context.sendActivity(replyActivity);
  }

  async showTaskModuleAsync(context: TurnContext) {
    const card = CardFactory.adaptiveCard(openTaskModuleCard());
    await context.sendActivity({ attachments: [card] });
  }
  async showRefreshCardAsync(context: TurnContext) {
    const member = await TeamsInfo.getMember(context, context.activity.from.id);
    const members = await TeamsInfo.getMembers(context);
    const ids = members.map((member) => member.id);
    const card = CardFactory.adaptiveCard(
      refreshCard("Initial message", member.name, ids)
    );
    await context.sendActivity({ attachments: [card] });
  }
  async signInAsync(context: TurnContext): Promise<void> {
    // https://github.com/microsoft/BotBuilder-Samples/blob/main/samples/javascript_nodejs/46.teams-auth/bots/dialogBot.js
    const card = CardFactory.adaptiveCard({
      signinCard,
    });
    await context.sendActivity({ attachments: [card] });
  }

  /**
   * Say hello and @ mention the current user.
   */
  private async sendPollActivityAsync(context: TurnContext) {
    const TextEncoder = require("html-entities").XmlEntities;

    const mention = {
      mentioned: context.activity.from,
      text: `<at>${new TextEncoder().encode(context.activity.from.name)}</at>`,
      type: "mention",
    };

    const replyActivity = MessageFactory.text(`Hi ${mention.text}`);
    replyActivity.entities = [mention];

    await context.sendActivity(replyActivity);
  }

  private async helpActivityAsync(context: TurnContext, text: string) {
    const card = CardFactory.adaptiveCard(helpCard(Actions, text));
    await context.sendActivity({ attachments: [card] });
  }

  async handleTeamsMessagingExtensionFetchTask(
    context: TurnContext,
    action: MessagingExtensionAction
  ): Promise<MessagingExtensionActionResponse> {
    this.deps.logger.debug(`Received fetch from messaging extension action`);
    return {
      task: {
        type: "continue",
        value: {
          title: "This is the configuration title",
          height: 250,
          width: 250,
          card: CardFactory.adaptiveCard(messageExtensionActionCard()),
        },
      },
    };
  }

  async handleTeamsMessagingExtensionSubmitAction(
    context: TurnContext,
    action: MessagingExtensionAction
  ): Promise<MessagingExtensionActionResponse> {
    this.deps.logger.debug(`Received messaging extension submit`);
    this.deps.logger.debug(
      `commandId: ${action.commandId}, data: `,
      action.data
    );
    return {
      composeExtension: {
        type: "result",
        attachmentLayout: "list",
        attachments: [
          CardFactory.adaptiveCard(confirmActionCard(action.data.theValue)),
        ],
      },
    };
  }
}
