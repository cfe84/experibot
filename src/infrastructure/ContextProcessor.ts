import { TeamsInfo } from "botbuilder";
import { TeamsChannelAccount, TurnContext } from "botbuilder-core";

export class ContextProcessor {
  constructor(private context: TurnContext) { }

  getPlatform(): string {
    const clientInfo: any = this.context.activity.entities?.find(entity => entity.type === "clientInfo")
    return clientInfo?.platform || "Undetermined"
  }

  async getCallerMemberAsync(): Promise<TeamsChannelAccount> {
    const member = await TeamsInfo.getMember(this.context, this.context.activity.from.id);
    return member
  }
}