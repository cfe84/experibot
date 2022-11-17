import { BrowserLocalStorage, CardFactory, MessageFactory, TeamsInfo, TurnContext } from "botbuilder";
import { userInfo } from "node:os";
import { IDependencies } from "../BotActivityHandler";
import { helpCard } from "../cards/helpCard";
import { identityCard } from "../cards/identityCard";
import { openAuthCard } from "../cards/auth-popup/openAuthCard";
import { openTaskModuleCard } from "../cards/openTaskModuleCard";
import { refreshCard } from "../cards/refreshCard";
import { ActivityHandler } from "./ActivityHandler";
import { BubbleDemoHandler } from "./BubbleDemoHandler";
import { PaymentInMeetingHandler } from "./PaymentInMeetingHandler";
import { TargetedBubbleHandler } from "./TargetedBubbleHandler";
import { configureAuthPopup } from "../cards/auth-popup/configureAuthPopup";
import { AuthenticationHandler } from "./AuthenticationInAppHandler";
import { ContextProcessor } from "../ContextProcessor";
import { inTeamsClientDemoCard } from "../cards/inTeamsClientDemoCard";
import { UserProcessor } from "../UserProcessor";

const DIFF = "diff";

const Actions: { [key: string]: string } = {
  SIGNIN: "signin",
  SHOW_TASK_MODULE: "show task module",
  SHOW_AUTH_POPUP: "show auth popup",
  SHOW_CONFIGURABLE_AUTH_POPUP: "show configurable auth popup",
  SHOW_BUBBLE: "show bubble",
  SHOW_TARGETED_BUBBLE: "show targeted bubble",
  SHOW_BUBBLE_CLOSE: "show closing bubble",
  SHOW_REFRESH: "show refresh",
  START_ACTIVITY: "start activity",
  CONFIRM_ANONYMOUS_IDENTITY: "confirm identity",
  MEETING_IS_DONE: "meeting is done",
  HELP: "help",
  MONITOR: "monitor participants",
  IN_TEAMS_APP_AC_DEMO: "in teams app ac demo"
};
const COMPLETE_ACTIVITY = "complete activity"

export class CommandHandler {
  static Actions = Actions

  constructor(private deps: IDependencies,
    private activityHandler: ActivityHandler,
    private bubbleDemoHandler: BubbleDemoHandler,
    private targetedBubbleDemoHandler: TargetedBubbleHandler,
    private authenticationInAppHandler: AuthenticationHandler,
    private paymentHandler: PaymentInMeetingHandler) { }

  async handleCommand(command: string, context: TurnContext) {
    switch (command) {
      case Actions.HELP:
        await this.helpActivityAsync(context, command);
        break;
      case Actions.SHOW_REFRESH:
        await this.showRefreshCardAsync(context);
        break;
      case Actions.SHOW_TASK_MODULE:
        await this.showTaskModuleAsync(context);
        break;
      case Actions.SHOW_AUTH_POPUP:
        await this.showAuthPopupAsync(context);
        break;
      case Actions.SHOW_CONFIGURABLE_AUTH_POPUP:
        await this.showConfigurableAuthPopupAsync(context);
        break;
      case Actions.SHOW_TARGETED_BUBBLE:
        await this.targetedBubbleDemoHandler.showTargetedBubbleAsync(context);
        break;
      case Actions.SHOW_BUBBLE:
        await this.bubbleDemoHandler.showBubbleAsync(context);
        break;
      case Actions.SHOW_BUBBLE_CLOSE:
        await this.bubbleDemoHandler.showClosingBubbleAsync(context);
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
      case Actions.MEETING_IS_DONE:
        await this.meetingIsDoneAsync(context)
        break
      case Actions.MONITOR:
        await this.monitorAsync(context)
        break;
      case Actions.IN_TEAMS_APP_AC_DEMO:
        await this.inTeamsAppDemoCardAsync(context);
        break;
      case DIFF:
        await this.diff(context);
        break;
      // case Actions.SIGNIN:
      //   await this.showSignInAsync(context)
      //   break
      default:
        await this.helpActivityAsync(context, command);
    }
  }

  async showConfigurableAuthPopupAsync(context: TurnContext) {
    const configurationCard = CardFactory.adaptiveCard(configureAuthPopup());
    await context.sendActivity({
      attachments: [configurationCard]
    });
  }


  // async showSignInAsync(context: TurnContext) {
  //   const nonce = this.deps.identityManager.generateNonce(
  //     context.activity?.from?.id
  //   );
  //   const url = `${process.env.BaseUrl}/auth/index.html?userid=${context.activity?.from?.id}&nonce=${nonce}`
  //   const card = CardFactory.adaptiveCard(openAuthCard(url));
  //   await context.sendActivity({
  //     attachments: [card]
  //   });
  // }

  async showAuthPopupAsync(context: TurnContext) {
    const url = context.activity.value?.url || "https://rlay.feval.ca/authPopup/"
    const card = CardFactory.adaptiveCard(openAuthCard(url));
    await context.sendActivity({
      attachments: [card]
    });
  }

  async meetingIsDoneAsync(context: TurnContext) {
    const replyActivity = MessageFactory.text("Meeting is done!"); // this could be an adaptive card instead
    const img = encodeURIComponent("https://i.imgur.com/RbCKrf8.gif")
    const url = `${process.env.BaseUrl}/bubble/meeting-is-done.html?message=${img}`
    const encodedUrl = encodeURIComponent(url as string);
    const height = 500
    const width = 400
    replyActivity.channelData = {
      notification: {
        alertInMeeting: true,
        externalResourceUrl: `https://teams.microsoft.com/l/bubble/${process.env.BotId}?url=${encodedUrl}&height=${height}&width=${width}&title=Meeting%20is%20finished&completionBotId=${process.env.BotId}`,
      },
    };
    await context.sendActivity(replyActivity);
  }

  private async monitorAsync(context: TurnContext) {
    const participants = await TeamsInfo.getMembers(context)
    const names = participants.map(p => p.name).join(", ")
    console.log(names)
    setTimeout(() => this.monitorAsync(context).then(() => { }), 10000)
  }

  private async confirmAnonymousIdentityAsync(context: TurnContext) {
    const userId = context.activity.from.id;
    const msa =
      this.deps.identityManager.getIdentityFromUserId(userId) ||
      "No MSA mapping found";
    const card = CardFactory.adaptiveCard(identityCard(msa, userId));
    await context.sendActivity({ attachments: [card] });
  }

  private async showTaskModuleAsync(context: TurnContext) {
    const card = CardFactory.adaptiveCard(openTaskModuleCard());
    this.deps.logger.log(`From: ${JSON.stringify(context.activity.from, null, 2)}`)
    await context.sendActivity({
      attachments: [card], suggestedActions: {
        "actions": [
          {
            title: "green",
            type: "imBack",
            value: "green"
          }
        ],
        to: [context.activity.from.id]
      }
    });
  }

  private async showRefreshCardAsync(context: TurnContext) {
    const contextProcessor = new ContextProcessor(context)
    const member = await contextProcessor.getCallerMemberAsync()
    const members = await TeamsInfo.getMembers(context);
    const ids = members.map((member) => member.id);
    const card = CardFactory.adaptiveCard(
      refreshCard("Initial message", member.name, contextProcessor.getPlatform(), ids)
    );
    await context.sendActivity({ attachments: [card] });
  }

  private async helpActivityAsync(context: TurnContext, text: string) {
    const card = CardFactory.adaptiveCard(helpCard(Actions, text));
    await context.sendActivity({ attachments: [card] });
  }

  private async inTeamsAppDemoCardAsync(context: TurnContext) {
    const card = CardFactory.adaptiveCard(inTeamsClientDemoCard());
    await context.sendActivity({ attachments: [card] });
  }

  private async diff(context: TurnContext) {
    const userProcessor = new UserProcessor(process.env.USER_STORE || "users");
    const team = context.activity.channelData.team.id;
    const users = await UserProcessor.siphonUsers(context);
    userProcessor.addExport(users, team);
    const diff = userProcessor.diffUsers(team);
    if (diff) {
      console.log(`Added\n=====\n\n${userProcessor.userListToString(diff.added)}\n\n`)
      console.log(`Removed\n=====\n\n${userProcessor.userListToString(diff.removed)}\n\n`)
    } else {
      console.log(`That's the first export`);
    }
  }
}