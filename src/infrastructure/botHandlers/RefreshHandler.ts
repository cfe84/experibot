import { TurnContext, TeamsInfo } from "botbuilder";
import { IDependencies } from "../BotActivityHandler";
import { refreshCard } from "../cards/refreshCard";
import { ContextProcessor } from "../ContextProcessor";

export class RefreshHandler {
  constructor(private deps: IDependencies) { }

  async handleRefreshCard(context: TurnContext) {
    this.deps.logger.debug("Refreshing card");
    const contextProcessor = new ContextProcessor(context)
    const member = await contextProcessor.getCallerMemberAsync()
    const platform = contextProcessor.getPlatform()
    const card = refreshCard(new Date().toISOString(), member.name, platform, [context.activity.from.id])
    return {
      status: 200,
      body: {
        statusCode: 200,
        type: "application/vnd.microsoft.card.adaptive",
        value: card,
      },
    };
  }
}