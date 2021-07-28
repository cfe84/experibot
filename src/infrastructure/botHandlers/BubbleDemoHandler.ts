import { MessageFactory, TurnContext } from "botbuilder";

export class BubbleDemoHandler {
  async showBubbleAsync(context: TurnContext) {
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

  async showClosingBubbleAsync(context: TurnContext) {
    const replyActivity = MessageFactory.text("I sent a bubble"); // this could be an adaptive card instead
    const emitter = encodeURIComponent(context.activity.from.name)
    const message = encodeURIComponent(context.activity.value?.message || "This is the bubble text")
    const url = `${process.env.BaseUrl}/bubble/?emitter=${emitter}&message=${message}&closeImmediately=true`
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