import { Activity, BotAdapter, CardFactory, ConversationParameters, ConversationReference, MessagingExtensionAction, MessagingExtensionActionResponse, TeamsInfo, TurnContext } from "botbuilder";
import { Application, Request, Response } from "express";
import { ILogger } from "../../domain/ILogger";
import { UserInfo } from "../../domain/UserInfo";
import { authBridgeRefreshCard } from "../cards/authentication-bridge/authBridgeRefreshCard";
import { authBridgeResult } from "../cards/authentication-bridge/authBridgeResult";
import { ContextProcessor } from "../ContextProcessor";
import { Middleware } from "../middleware/Middleware";

const HANDLER_NAME = "AuthenticationBridgeHandler";

/**
 * Record that acts as the entity being stored in this scenario. This could be a payment.
 */
export interface Record {
  id: string
  content: string

  /**
   * The chatId needs to be stored. This is retrieved from the web app in the task module using
   * Teams javascript client, and it needs to be passed as part of the call to make the link between 
   * Teams to the web app displayed in task module, and then back from the app to the rest of the
   * process with cards.
   */
  chatId: string

  /**
   * This is required because the process in this example is differentiated between requester
   * and other "regular" participants in the chat. Similarly to chatId, requesterId can be
   * retrieved from the task module web app using the Teams javascript client.
   * 
   * If the rest of the process is the same for everyone, then the requester ID can be dismissed.
   * 
   * It's retrieved from the user identity passed alongside the first POST request.
   */
  requesterId: string
}

/**
 * DTO received in input to initiate the process.
 */
export interface RecordRequest {
  chatId: string,
  tenantId: string,
  content: string
}

/**
 * Injected dependencies.
 */
export interface IAuthenticationBridgeDeps {
  authMiddleware: Middleware,
  logger: ILogger,
  botAdapter: BotAdapter
}

/**
 * Demo of how to bridge identity in a web app displayed in a task module or a tab,
 * and activities in the bot (in this case, adaptive cards sent in the chat).
 */
export class AuthenticationBridgeHandler {
  /**
   * In-memory store of records. In real life this would probably be in a database.
   */
  private records: {[recordId: string]: Record} = {}

  /**
   * In-memory cache of conversations. Unfortunately these are required to send
   * messages to the chat "proactively", i.e. not as a response to someone else's
   * message.
   * 
   * In real life this would probably be in a centralized cache (e.g. Redis).
   */
  private conversations: {[chatId: string]: Partial<ConversationReference>} = {}

  constructor(private deps: IAuthenticationBridgeDeps, app: Application) {
    // Authenticate request using the authMiddleware.
    app.post("/api/records", deps.authMiddleware, this.postRecords.bind(this));
  }

  /**
   * Step 1.: display task module.
   * 
   * This is called when showing the message extension. Two things happen:
   * 1. We save the conversation reference, this is required for later send a message to the chat.
   * 2. Return a task module in response.
   * 
   * @param context 
   * @param action 
   * @returns 
   */
   async showMessageExtension(
    context: TurnContext,
    action: MessagingExtensionAction
  ): Promise<MessagingExtensionActionResponse> {
    this.deps.logger.debug(`[${HANDLER_NAME}] Received fetch from messaging extension action for AuthenticatedTaskModuleHandler`);
    this.conversations[context.activity.conversation.id] = TurnContext.getConversationReference(context.activity);
    this.deps.logger.debug(`[${HANDLER_NAME}] Save conversation '${context.activity.conversation.id}'`);
    return {
      task: {
        type: "continue",
        value: {
          title: "This is the configuration title",
          height: 500,
          width: 500,
          url: `${process.env.BaseUrl}/authenticatedTaskModule/`
        },
      },
    };
  }

  /**
   * Step 2: display the web page in task module.
   * 
   * The webpage is [RecordConfiguration](/src/frontend/authenticatedTaskModule/RecordConfiguration.tsx)
   * 
   * It authenticates the user with AAD using the javascript Teams SDK and retrieves an id/access token.
   * It also retrieves the chatId from the context, and adds that to the record.
   */

  /**
   * API invoked by the task module web app to POST the record. It is authenticated using the access token
   * retrieved from the webapp, using the auth middleware, which adds `userInfo` deduces from the id_token
   * to the request object.
   * 
   * It then saves the record and send a refresh adaptive card.
   * 
   * @param req 
   * @param res 
   */
   async postRecords(req: Request, res: Response) {
    const userInfo = (req as any).userInfo as UserInfo;
    const content = req.body as RecordRequest;
    const record: Record = {
      id: Math.floor(Math.random() * 100000000).toString(),
      chatId: content.chatId,
      content: content.content,
      requesterId: userInfo.aadObjectId
    };
    this.records[record.id] = (record);
    this.deps.logger.debug(`[${HANDLER_NAME}] Received record '${record.content}' for requester '${record.requesterId}' in chat '${record.chatId}'`);
    res.statusCode = 200;
    res.json(record);
    res.end();
    await this.sendRefreshCard(record);
  }

  /**
   * Send the refresh card to the chat.
   * 
   * 1. retrieve the conversation reference saved when the message extension
   * 2. use continueConversation to send the refresh card to everyone.
   * 
   * @param record 
   */
  private async sendRefreshCard(record: Record) {
    const conversationReference = this.conversations[record.chatId];
    this.deps.logger.debug(`[${HANDLER_NAME}] Retrieved conversation '${conversationReference.conversation?.id}'`);
    const botId = process.env.BotId || "";
    await this.deps.botAdapter.continueConversationAsync(botId, conversationReference, async (context) => {
      const contextProcessor = new ContextProcessor(context);
      const users = await contextProcessor.getMembers();
      const card = CardFactory.adaptiveCard(authBridgeRefreshCard(record.id, users.map(member => member.id)));
      const activity = { attachments: [card] } as Partial<Activity>;
      this.deps.logger.debug(`[${HANDLER_NAME}] Sending notification to people in conversation ${record.chatId}.`);
      await context.sendActivity(activity);
    });
  }

  /**
   * Handles the refresh based on the record that was stored.
   * 
   * It compares the ID received from bot framework to the id stored as requester alongside
   * the request, and send a differentiated message based on whether the current user made
   * the request or not.
   * 
   * @param context 
   * @returns 
   */
  async handleRefreshCard(context: TurnContext) {
    this.deps.logger.debug(`[${HANDLER_NAME}] Refreshing card for request '${context.activity.value}' and user '${context.activity.from.name}'`);
    const userObjectId = context.activity.from.aadObjectId;
    const recordId = context.activity?.value?.action?.data?.recordId
    const record = this.records[recordId];
    let message = "";
    if (!record) {
      message = `Record not found: ${recordId}`;
    } else if (record.requesterId === userObjectId) {
      message = `You initiated the request. It said: ${record.content}.`;
    } else {
      message = `The request was sent by someone else (${record.requesterId}). It says: ${record.content}`;
    }
    const card = authBridgeResult(message)
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