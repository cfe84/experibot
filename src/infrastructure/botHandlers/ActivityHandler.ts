import {
  CardFactory,
  InvokeResponse,
  MessageFactory,
  TeamsChannelAccount,
  TeamsInfo,
  TurnContext
} from "botbuilder";
import { v4 as uuid } from "uuid"
import { IDependencies } from "../BotActivityHandler";

/**
 * Adaptive cards used in this activity.
 */

// Placeholder card that will only trigger refresh to display the right card
// to the user
import { activityRefreshCard } from "../cards/activityRefreshCard";
// Display status to the activity initiator
import { activityStatusCard } from "../cards/activityStatusCard";
// Request activity participants to complete the task
import { activityTaskCard } from "../cards/activityTaskCard";
// Confirm that activity was completed.
import { confirmActionCard } from "../cards/confirmActionCard";

interface ParticipantInfo {
  id: string,
  completed: boolean,
  name: string
}

type ParticipantStatus = { [id: string]: ParticipantInfo }

interface ActivityStatus {
  initiatorId: string,
  participants: ParticipantStatus
}

/**
 * Simulates an activity initiated by one participant (initiator) 
 * and completed by multiple participants (actors). The *initiator*
 * sees a card showing completion status, and each *actor* sees
 * a card either asking them to complete the task (by pressing
 * a button) or confirming completion.
 * 
 * This uses Adaptive Cards Universal Action Model, and more
 * specifically the "refresh" action: a first empty placeholder card
 * is sent to everyone, with a "refresh" action embedded. This
 * triggers each of the clients to callback the backend, at which
 * time the card everyone should see is displayed
 */
export class ActivityHandler {
  /**
   * In memory storage of all ongoing activities. In real-life
   * this might be replaced by either a centralized cache or
   * storage to support distribution and make activities
   * resilient.
   */
  private activities: { [key: string]: ActivityStatus } = {}

  constructor(private deps: IDependencies) { }

  /**
   * Triggered when a participant starts an activity.
   * @param context 
   */
  async startActivityAsync(context: TurnContext) {
    const members = await TeamsInfo.getMembers(context);
    const ids = members.map((member) => member.id);
    const initiatorId = context.activity.from.id
    const activityId = this.createAndStoreNewActivity(members, initiatorId);
    const card = CardFactory.adaptiveCard(
      // this card is a placeholder that just uses the AC
      // refresh action to retrieve the actual card for this
      // specific user.
      activityRefreshCard(activityId, ids)
    );
    await context.sendActivity({ attachments: [card] });
  }

  /**
   * Called when the refresh card placeholder invokes the backend. This
   * method determine the card that should be displayed based on the
   * participant role and status, then sends it back. Then the client
   * replaces the refresh card by the appropriate one.
   * 
   * @param context 
   * @returns Card to be displayed to that particular user.
   */
  async handleRefreshAsync(context: TurnContext): Promise<InvokeResponse> {
    const currentUserId = context.activity.from.id
    const activityId = context.activity.value.action.data.activityId
    const card = this.getCard(activityId, currentUserId)
    return {
      status: 200,
      body: {
        statusCode: 200,
        type: "application/vnd.microsoft.card.adaptive",
        value: card
      },
    };
  }

  /**
   * Invoked when someone completes the activity. This updates the
   * activity in storage, then triggers a refresh for everyone
   * @param context 
   */
  async completeActivityAsync(context: TurnContext) {
    const activityId = context.activity.value.activityId
    const participantId = context.activity.from.id
    this.activities[activityId].participants[participantId].completed = true
    await this.triggerRefreshAsync(context);
  }

  /**
   * Triggers a refresh for all participants, by updating the
   * activity card with a refresh card, which itself will invoke
   * the backend to retrieve the card specific to each user.
   * The typical round trip is < .5s
   * @param context 
   */
  private async triggerRefreshAsync(context: TurnContext) {
    const activityId = context.activity.value.activityId
    const members = await TeamsInfo.getMembers(context);
    const ids = members.map((member) => member.id);
    const card = activityRefreshCard(activityId, ids);
    const message = MessageFactory.attachment(CardFactory.adaptiveCard(card));
    message.id = context.activity.replyToId;
    this.deps.logger.debug(`Update activity ${message.id}`);
    await context.updateActivity(message);
  }

  /**
 * Create a new activity and store it in memory.
 * 
 * @param members users participating to the activity
 * @param initiatorId Id of the initiator
 * @returns a unique activity id used to interact with storage
 */
  private createAndStoreNewActivity(members: TeamsChannelAccount[], initiatorId: string) {
    const activityId = uuid();
    const participants: ParticipantStatus = {};
    members.forEach(member => participants[member.id] = {
      completed: false,
      id: member.id,
      name: member.name
    });
    this.activities[activityId] = {
      initiatorId,
      participants
    };
    return activityId;
  }

  /**
   * Find the card that should be displayed to a particular
   * user based on their status.
   * 
   * @param activityId Points to the activity that is refreshed
   * @param initiatorId Id of initiator
   * @param fromId Id of the user for which the client is refreshing card
   * @returns 
   */
  private getCard(activityId: string, fromId: string) {
    const activity = this.activities[activityId]
    if (!activity) {
      return confirmActionCard(`Activity not found: ${activityId}`)
    }
    const initiatorId = activity.initiatorId
    if (initiatorId === fromId) {
      // For initiator we display status
      const usersWhoCompleted = Object.values(activity.participants)
        .filter(participant => participant.completed)
        .map(participant => participant.name)
      return activityStatusCard(usersWhoCompleted)
    } else if (!activity.participants[fromId].completed) {
      // If participant didn't complete the activity yet
      // we show them the activity card with a button
      return activityTaskCard(activityId, initiatorId)
    } else {
      // If participant completed the activity we show a
      // confirmation message.
      return confirmActionCard(`You completed the activity`)
    }
  }
}