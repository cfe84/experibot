import { TurnContext, CardFactory, TeamsInfo } from "botbuilder";
import { IDependencies } from "../BotActivityHandler";
import { welcomeCard } from "../cards/welcome/welcomeCard";

export class WelcomeUserHandler {
  constructor(private deps: IDependencies) { }

  async handleConversationUpdate(context: TurnContext) {
    if (context.activity.channelId === "directline") {
      return
    }
    const userId = context.activity.from.id
    const tenantId = context.activity.conversation.tenantId || "undefined"
    const member = (await TeamsInfo.getMember(context, userId))
    const username = member.name

    this.deps.logger.debug(`Received conversation update for ${userId} in tenant ${tenantId}`);
    this.deps.logger.debug(`Payload:`, JSON.stringify(context.activity, null, 2))

    const card = CardFactory.adaptiveCard(welcomeCard(username, userId, tenantId));
    await context.sendActivity({
      attachments: [card]
    });
  }
}