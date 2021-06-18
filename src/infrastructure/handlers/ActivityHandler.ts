import { CardFactory, InvokeResponse, MessageFactory, TeamsInfo, TurnContext } from "botbuilder";
import { BotActivityHandlerDependencies } from "../BotActivityHandler";
import { activityRefreshCard } from "../cards/activityRefreshCard";
import { activityStatusCard } from "../cards/activityStatusCard";
import { activityTaskCard } from "../cards/activityTaskCard";
import { v4 as uuid } from "uuid"
import { confirmActionCard } from "../cards/confirmActionCard";

type ParticipantStatus = { [id: string]: boolean }

interface ActivityStatus {
  initiatorId: string,
  participants: ParticipantStatus
}

export class ActivityHandler {
  private activities: { [key: string]: ActivityStatus } = {}
  constructor(private deps: BotActivityHandlerDependencies) {
  }


  async startActivityAsync(context: TurnContext) {
    const members = await TeamsInfo.getMembers(context);
    const ids = members.map((member) => member.id);
    const activityId = uuid()
    const initiatorId = context.activity.from.id
    const participants: ParticipantStatus = {}
    ids.forEach(id => participants[id] = false)
    this.activities[activityId] = {
      initiatorId,
      participants
    }
    const card = CardFactory.adaptiveCard(
      activityRefreshCard(activityId, initiatorId, ids)
    );
    await context.sendActivity({ attachments: [card] });
  }

  private getCard(activityId: string, initiatorId: string, fromId: string) {
    const activity = this.activities[activityId]
    if (initiatorId === fromId) {
      return activityStatusCard(Object.keys(activity.participants).filter(id => activity.participants[id]))
    } else if (!activity.participants[fromId]) {
      return activityTaskCard(activityId, initiatorId)
    } else {
      return confirmActionCard(`You completed the activity`)
    }
  }

  async handleRefreshAsync(context: TurnContext): Promise<InvokeResponse> {
    const initiatorId = context.activity.value.action.data.initiatorId
    const activityId = context.activity.value.action.data.activityId
    const card = this.getCard(activityId, initiatorId, context.activity.from.id)
    return {
      status: 200,
      body: {
        statusCode: 200,
        type: "application/vnd.microsoft.card.adaptive",
        value: card
      },
    };
  }

  async completeActivityAsync(context: TurnContext) {
    const initiatorId = context.activity.value.initiatorId
    const activityId = context.activity.value.activityId
    const participantId = context.activity.from.id
    this.activities[activityId].participants[participantId] = true
    const members = await TeamsInfo.getMembers(context);
    const ids = members.map((member) => member.id);
    const card = activityRefreshCard(activityId, initiatorId, ids)
    const message = MessageFactory.attachment(CardFactory.adaptiveCard(card))
    message.id = context.activity.replyToId
    this.deps.logger.debug(`Update activity ${message.id}`)
    await context.updateActivity(message)
  }
}