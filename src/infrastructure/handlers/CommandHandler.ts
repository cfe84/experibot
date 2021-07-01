import { CardFactory, MessageFactory, TeamsInfo, TurnContext } from "botbuilder";
import { IDependencies } from "../BotActivityHandler";
import { helpCard } from "../cards/helpCard";
import { identityCard } from "../cards/identityCard";
import { openTaskModuleCard } from "../cards/openTaskModuleCard";
import { refreshCard } from "../cards/refreshCard";
import * as signinCard from "../cards/signinCard.json";
import { ActivityHandler } from "./ActivityHandler";

const Actions: { [key: string]: string } = {
  SIGNIN: "signin",
  SHOW_TASK_MODULE: "show task module",
  SHOW_BUBBLE: "show bubble",
  SHOW_REFRESH: "show refresh",
  START_ACTIVITY: "start activity",
  CONFIRM_ANONYMOUS_IDENTITY: "confirm identity",
  HELP: "help",
};
const COMPLETE_ACTIVITY = "complete activity"

export class CommandHandler {
  static Actions = Actions

  constructor(private deps: IDependencies, private activityHandler: ActivityHandler) { }

  async handleCommand(command: string, context: TurnContext) {
    switch (command) {
      case Actions.HELP:
        await this.helpActivityAsync(context, command);
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
      case Actions.CONFIRM_ANONYMOUS_IDENTITY:
        await this.confirmAnonymousIdentityAsync(context);
        break;
      case Actions.START_ACTIVITY:
        await this.activityHandler.startActivityAsync(context);
        break;
      case COMPLETE_ACTIVITY:
        await this.activityHandler.completeActivityAsync(context)
        break
      default:
        await this.helpActivityAsync(context, command);
    }
  }


  private async confirmAnonymousIdentityAsync(context: TurnContext) {
    const userId = context.activity.from.id;
    const msa =
      this.deps.identityManager.getIdentityFromUserId(userId) ||
      "No MSA mapping found";
    const card = CardFactory.adaptiveCard(identityCard(msa, userId));
    await context.sendActivity({ attachments: [card] });
  }

  private async showBubbleAsync(context: TurnContext) {
    const replyActivity = MessageFactory.text("I sent a bubble"); // this could be an adaptive card instead
    const emitter = encodeURIComponent(context.activity.from.name)
    const message = encodeURIComponent(context.activity.value?.message || "This is the bubble text")
    const url = `${process.env.BaseUrl}/bubble/?emitter=${emitter}&message=${message}`
    const encodedUrl = encodeURIComponent(url as string);
    replyActivity.channelData = {
      notification: {
        alertInMeeting: true,
        externalResourceUrl: `https://teams.microsoft.com/l/bubble/${process.env.BotId}?url=${encodedUrl}&height=300&width=500&title=Payment&completionBotId=${process.env.BotId}`,
      },
    };
    await context.sendActivity(replyActivity);
  }

  private async showTaskModuleAsync(context: TurnContext) {
    const card = CardFactory.adaptiveCard(openTaskModuleCard());
    await context.sendActivity({ attachments: [card] });
  }

  private async showRefreshCardAsync(context: TurnContext) {
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
    const card = CardFactory.adaptiveCard({ signinCard, });
    await context.sendActivity({ attachments: [card] });
  }

  private async helpActivityAsync(context: TurnContext, text: string) {
    const card = CardFactory.adaptiveCard(helpCard(Actions, text));
    await context.sendActivity({ attachments: [card] });
  }
}