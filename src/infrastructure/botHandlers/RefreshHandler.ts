import { TurnContext, TeamsInfo } from "botbuilder";
import { IDependencies } from "../BotActivityHandler";
import { refreshCard } from "../cards/refreshCard";

export class RefreshHandler {
  constructor(private deps: IDependencies) { }

  async handleRefreshCard(context: TurnContext) {
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
}