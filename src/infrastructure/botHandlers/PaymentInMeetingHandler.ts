import {
  CardFactory,
  InvokeResponse,
  MessageFactory,
  MessagingExtensionAction,
  MessagingExtensionActionResponse,
  TaskModuleRequest,
  TaskModuleResponse,
  TeamsChannelAccount,
  TeamsInfo,
  TurnContext
} from "botbuilder";
import { v4 as uuid } from "uuid"
import { IDependencies } from "../BotActivityHandler";
import { configurePaymentCard } from "../cards/payments/configurePaymentCard";
import { confirmPaymentCard } from "../cards/payments/confirmPaymentCard";
import { paymentRefreshCard } from "../cards/payments/paymentRefreshCard";
import { paymentRequestedCard } from "../cards/payments/paymentRequestedCard";
import { paymentStatusCard } from "../cards/payments/paymentStatusCard";

interface ParticipantInfo {
  id: string,
  completed: boolean,
  name: string
}

interface ProductInfo {
  id: string,
  name: string,
  price: number
}

type ParticipantStatus = { [id: string]: ParticipantInfo }

interface PaymentStatus {
  initiatorId: string,
  selectedProduct: ProductInfo,
  participants: ParticipantStatus,
  replyToId: string
}

export class PaymentInMeetingHandler {
  private payments: { [key: string]: PaymentStatus } = {}
  private products: ProductInfo[] = [
    { id: "1", name: "Yoga beginner lesson", price: 50 },
    { id: "2", name: "Yoga intermediate lesson", price: 80 }
  ]

  constructor(private deps: IDependencies) { }

  async showMessagingExtension(
    context: TurnContext,
    action: MessagingExtensionAction
  ): Promise<MessagingExtensionActionResponse> {
    this.deps.logger.debug(`Starting payment process`);
    const members = await TeamsInfo.getMembers(context);
    const users = members.map((act) => ({
      name: act.name,
      id: act.id
    }))

    return {
      task: {
        type: "continue",
        value: {
          title: "This is the configuration title",
          height: 500,
          width: 500,
          card: CardFactory.adaptiveCard(configurePaymentCard(users, this.products)),
        },
      },
    };
  }

  async paymentRequestSubmitted(
    context: TurnContext,
    action: MessagingExtensionAction
  ): Promise<MessagingExtensionActionResponse> {
    this.deps.logger.debug(`Received payment request from messaging extension`);

    const members = await TeamsInfo.getMembers(context)
    const selectedUsers = members.filter(user => {
      const userFieldName = `user-${user.id}`
      return action.data[userFieldName] === "true"
    })
    const selectedProductId = action.data.productId
    const selectedProduct = this.products.find(product => product.id === selectedProductId) as ProductInfo
    const initiatorId = context.activity.from.id
    const paymentRequestId = this.createAndStoreNewPayment(selectedUsers, initiatorId, selectedProduct, context.activity.replyToId as string);

    // const allUsersIds = members.map((member) => member.id);
    const userIds = selectedUsers.map((member) => member.id);
    const card = CardFactory.adaptiveCard(
      paymentRefreshCard(paymentRequestId, [initiatorId, ...userIds])
    );
    await context.sendActivity({ attachments: [card] });

    return {};
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
    const paymentRequestId = context.activity.value.action.data.paymentRequestId
    const card = this.getCard(paymentRequestId, currentUserId)
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
  async completePaymentAsync(context: TurnContext, taskModuleRequest: TaskModuleRequest): Promise<TaskModuleResponse> {
    const paymentRequestId = taskModuleRequest.data.paymentRequestId
    const participantId = context.activity.from.id
    this.deps.logger.debug(`Completing payment for ${participantId} on payment ${paymentRequestId}`)
    const paymentRequest = this.payments[paymentRequestId]
    paymentRequest.participants[participantId].completed = true
    await this.triggerRefreshAsync(context, paymentRequestId);
    return {}
  }

  fetchPaymentTaskModule(context: TurnContext): TaskModuleResponse {
    const paymentRequestId = context.activity?.value.data.paymentRequestId
    this.deps.logger.debug(`Fetching payment for `, paymentRequestId)
    return {
      task: {
        type: "continue",
        value: {
          title: "Proceed to payment",
          height: 500,
          width: "medium",
          url: `${process.env.BaseUrl}/payments/index.html?userid=${context.activity?.from?.id}&paymentRequestId=${paymentRequestId}`
        },
      },
    };
  }

  async retrievePaymentRequest(req: Express.Request, res: Express.Response) {
  }

  /**
   * Triggers a refresh for all participants, by updating the
   * activity card with a refresh card, which itself will invoke
   * the backend to retrieve the card specific to each user.
   * The typical round trip is < .5s
   * @param context 
   */
  private async triggerRefreshAsync(context: TurnContext, paymentRequestId: string) {
    this.deps.logger.debug(`Refreshing paymentRequestId ${paymentRequestId}`)
    const paymentRequest = this.payments[paymentRequestId]
    const ids = Object.values(paymentRequest.participants).map((participant) => participant.id);
    const card = paymentRefreshCard(paymentRequestId, [paymentRequest.initiatorId, ...ids]);
    const message = MessageFactory.attachment(CardFactory.adaptiveCard(card));
    message.id = paymentRequest.replyToId;
    this.deps.logger.debug(`Update activity ${paymentRequest.replyToId}`);
    await context.updateActivity(message);
  }

  /**
 * Create a new activity and store it in memory.
 * 
 * @param members users participating to the activity
 * @param initiatorId Id of the initiator
 * @returns a unique activity id used to interact with storage
 */
  private createAndStoreNewPayment(members: TeamsChannelAccount[], initiatorId: string, selectedProduct: ProductInfo, replyToId: string) {
    const paymentRequestId = uuid();
    const participants: ParticipantStatus = {};
    members.forEach(member => participants[member.id] = {
      completed: false,
      id: member.id,
      name: member.name
    });
    this.payments[paymentRequestId] = {
      initiatorId,
      participants,
      selectedProduct,
      replyToId
    };
    return paymentRequestId;
  }

  /**
   * Find the card that should be displayed to a particular
   * user based on their status.
   * 
   * @param paymentRequestId Points to the activity that is refreshed
   * @param initiatorId Id of initiator
   * @param fromId Id of the user for which the client is refreshing card
   * @returns 
   */
  private getCard(paymentRequestId: string, fromId: string) {
    const paymentRequest = this.payments[paymentRequestId]
    if (!paymentRequest) {
      return confirmPaymentCard(`Payment not found: ${paymentRequestId}`)
    }
    const initiatorId = paymentRequest.initiatorId
    if (initiatorId === fromId) {
      // For initiator we display status
      const usersWhoCompleted = Object.values(paymentRequest.participants)
        .filter(participant => participant.completed)
        .map(participant => participant.name)
      return paymentStatusCard(usersWhoCompleted)
    } else if (!paymentRequest.participants[fromId].completed) {
      // If participant didn't complete the activity yet
      // we show them the activity card with a button
      return paymentRequestedCard(paymentRequestId, initiatorId, paymentRequest.selectedProduct)
    } else {
      // If participant completed the activity we show a
      // confirmation message.
      return confirmPaymentCard(`${paymentRequest.selectedProduct.name} for $${paymentRequest.selectedProduct.price}`)
    }
  }
}