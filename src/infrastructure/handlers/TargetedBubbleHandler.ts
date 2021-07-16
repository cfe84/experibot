import { MessageFactory, TurnContext } from "botbuilder";

// The bubble content itself is in ../application/static/targeted-bubble

export class TargetedBubbleHandler {
  async showTargetedBubbleAsync(context: TurnContext) {
    const replyActivity = MessageFactory.text("I sent a targeted bubble"); // this could be an adaptive card instead
    const url = `${process.env.BaseUrl}/targeted-bubble/`
    const encodedUrl = encodeURIComponent(url as string);
    replyActivity.channelData = {
      notification: {
        alertInMeeting: true,
        externalResourceUrl: `https://teams.microsoft.com/l/bubble/${process.env.BotId}?url=${encodedUrl}&height=300&width=500&title=Payment&completionBotId=${process.env.BotId}`,
      },
    };
    await context.sendActivity(replyActivity);
  }
}