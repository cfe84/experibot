import {
  InvokeResponse,
  MessagingExtensionAction,
  MessagingExtensionActionResponse,
  TabRequest,
  TabResponse,
  TaskModuleRequest,
  TaskModuleResponse,
  TurnContext,
} from "botbuilder-core";
import {
  BotAdapter,
  SigninStateVerificationQuery,
  TeamsActivityHandler,
} from "botbuilder";
import { } from "botbuilder-dialogs";

import { ILogger } from "../domain/ILogger";
import { IdentityManager } from "../domain/IdentityManager";
import { ActivityHandler } from "./botHandlers/ActivityHandler";
import { CommandHandler } from "./botHandlers/CommandHandler";
import { MessagingExtensionHandler } from "./botHandlers/MessagingExtensionDemoHandler";
import { RefreshHandler } from "./botHandlers/RefreshHandler";
import { AuthenticationHandler } from "./botHandlers/AuthenticationInAppHandler";
import { ChainedTaskModulesHandler } from "./botHandlers/ChainedTaskModulesHandler";
import { BubbleDemoHandler } from "./botHandlers/BubbleDemoHandler";
import { TargetedBubbleHandler } from "./botHandlers/TargetedBubbleHandler";
import { PaymentInMeetingHandler } from "./botHandlers/PaymentInMeetingHandler";
import { confirmActionCard } from "./cards/confirmActionCard";
import { WelcomeUserHandler } from "./botHandlers/WelcomeUserHandler";
import { AuthenticationBridgeHandler } from "./botHandlers/AuthenticationBridgeHandler";
import { Middleware } from "./middleware/Middleware";
import { Application } from "express";

export interface IDependencies {
  logger: ILogger;
  identityManager: IdentityManager;
  botAdapter: BotAdapter;
  authMiddleware: Middleware;
}

const INVOKE_REFRESH = "refreshCard";
const INVOKE_START_ACTIVITY = "startActivity";
const HANDLER_PAYMENT = "payments"
const HANDLER_BRIDGE = "authenticationBridge"

export class BotActivityHandler extends TeamsActivityHandler {
  private activityHandler: ActivityHandler
  private commandHandler: CommandHandler
  private messagingExtensionHandler: MessagingExtensionHandler
  private refreshHandler: RefreshHandler
  private authenticationHandler: AuthenticationHandler
  private chainedTaskModuleHandler: ChainedTaskModulesHandler
  private bubbleDemoHandler: BubbleDemoHandler
  private targetedBubbleDemoHandler: TargetedBubbleHandler
  private paymentHandler: PaymentInMeetingHandler
  private welcomeUserHandler: WelcomeUserHandler
  private authenticationBridgeHandler: AuthenticationBridgeHandler

  constructor(app: Application, private deps: IDependencies) {
    super();
    // Handle messages
    this.onMessage(
      async (context, next) => await this.handleMessagesAsync(context, next)
    );
    // Handle invoke by bot action
    this.onInvokeActivity = (context) => this.handleInvokeAsync(context);

    this.activityHandler = new ActivityHandler(deps)
    this.bubbleDemoHandler = new BubbleDemoHandler()
    this.targetedBubbleDemoHandler = new TargetedBubbleHandler()
    this.paymentHandler = new PaymentInMeetingHandler(deps)
    this.authenticationHandler = new AuthenticationHandler(deps)
    this.commandHandler = new CommandHandler(deps,
      this.activityHandler,
      this.bubbleDemoHandler,
      this.targetedBubbleDemoHandler,
      this.authenticationHandler,
      this.paymentHandler)
    this.messagingExtensionHandler = new MessagingExtensionHandler(deps, this.commandHandler)
    this.refreshHandler = new RefreshHandler(deps)
    this.chainedTaskModuleHandler = new ChainedTaskModulesHandler(deps)
    this.welcomeUserHandler = new WelcomeUserHandler(deps)
    this.authenticationBridgeHandler = new AuthenticationBridgeHandler(deps, app)
  }



  /**
   * Handles invoke types not currently supported by the teamsActivityHandler,
   * such as the refresh
   * @param context
   * @returns
   */
  async handleInvokeAsync(context: TurnContext): Promise<InvokeResponse> {
    this.deps.logger.debug(`Invoke of type `, context.activity.name);

    if (context.activity.name === "adaptiveCard/action") {
      return await this.handleAdaptiveCardAction(context);
    }

    try {
      return super.onInvokeActivity(context);
    } catch (error) {
      this.deps.logger.error(error);
      return {
        status: 500,
      };
    }
  }

  async handleTeamsSigninVerifyState(context: TurnContext, query: SigninStateVerificationQuery): Promise<void> {
    this.deps.logger.debug(JSON.stringify(context.activity, null, 2))
  }

  async handleAdaptiveCardAction(context: TurnContext): Promise<InvokeResponse> {
    if (context.activity?.value?.action?.verb === INVOKE_REFRESH) {
      return await this.refreshHandler.handleRefreshCard(context);
    } else if (context.activity?.value?.action?.verb === INVOKE_START_ACTIVITY) {
      return await this.activityHandler.handleRefreshAsync(context)
    } else if (context.activity?.value?.action?.data?.handler === HANDLER_PAYMENT) {
      return await this.paymentHandler.handleRefreshAsync(context)
    } else if (context.activity?.value?.action?.data?.handler === HANDLER_BRIDGE) {
      return await this.authenticationBridgeHandler.handleRefreshCard(context);
    }
    this.deps.logger.error(`Verb not implemented: ${context.activity.value?.action?.verb}. Activity was:`, JSON.stringify(context.activity, null, 2))
    return {
      status: 200,
      body: {
        statusCode: 200,
        type: "application/vnd.microsoft.card.adaptive",
        value: confirmActionCard(`There was a bug in the adaptive card handler.`),
      },
    }
  }

  async handleTeamsTaskModuleSubmit(
    context: TurnContext,
    taskModuleRequest: TaskModuleRequest
  ): Promise<TaskModuleResponse> {
    this.deps.logger.debug(
      `Task module was submitted with module: ${taskModuleRequest.data.moduleName}`
    );
    this.deps.logger.debug(`Message was `, taskModuleRequest)
    if (taskModuleRequest.data.moduleName === "payment") {
      return this.paymentHandler.completePaymentAsync(context, taskModuleRequest)
    } else if (taskModuleRequest.data.moduleName === "chained") {
      return await this.chainedTaskModuleHandler.processTaskModuleRequest(taskModuleRequest)
    }
    this.deps.logger.debug(`Message was `, taskModuleRequest)
    throw Error("Not supported: " + taskModuleRequest.data)
  }

  async handleTeamsTaskModuleFetch(
    context: TurnContext,
    taskModuleRequest: TaskModuleRequest
  ): Promise<TaskModuleResponse> {
    this.deps.logger.debug(
      "Returning task module of type",
      taskModuleRequest.data.module
    );
    if (taskModuleRequest.data?.module === "payment") {
      return this.paymentHandler.fetchPaymentTaskModule(context)
    }
    else if (taskModuleRequest.data?.module === "authentication") {
      return (this.authenticationHandler.fetchAuthenticationTaskModule(context) as TaskModuleResponse);
    } else {
      return this.chainedTaskModuleHandler.fetchTaskModule();
    }
  }

  private async handleMessagesAsync(
    context: TurnContext,
    nextAsync: () => Promise<void>
  ) {
    TurnContext.removeRecipientMention(context.activity);
    if (
      !context.activity.text &&
      (!context.activity.value || (!context.activity.value["text"] && !context.activity.value["action"]))
    ) {
      this.deps.logger.error(
        `BotActivityHandler.handleMessageAsync: Missing "context.activity.text" property in `,
        context.activity
      );
      return;
    }
    const text = (context.activity.text || context.activity.value["text"] || context.activity.value["action"])
      .trim()
      .toLowerCase();
    this.deps.logger.debug(`Received a simple message: ${text}`)
    await this.commandHandler.handleCommand(text, context)
    await nextAsync();
  }

  async handleTeamsMessagingExtensionFetchTask(
    context: TurnContext,
    action: MessagingExtensionAction
  ): Promise<MessagingExtensionActionResponse> {
    if (action.commandId === "demoAction") {
      return this.messagingExtensionHandler.showMessageExtension(context, action)
    } else if (action.commandId === "triggerPayment") {
      return this.paymentHandler.handleMessagingExtensionRequest(context, action)
    } else if (action.commandId === "demoAuthenticatedTM") {
      return this.authenticationBridgeHandler.showMessageExtension(context, action)
    } else {
      throw Error("Unknown messaging extension command: " + context.activity.value.commandId)
    }
  }

  async handleTeamsMessagingExtensionSubmitAction(
    context: TurnContext,
    action: MessagingExtensionAction
  ): Promise<MessagingExtensionActionResponse> {
    if (action.commandId === "triggerPayment") {
      return this.paymentHandler.handleMessagingExtensionRequest(context, action)
    } else {
      return this.messagingExtensionHandler.defaultMessageExtensionSubmitted(context, action)
    }
  }

  protected async handleTeamsTabFetch(context: TurnContext, tabRequest: TabRequest): Promise<TabResponse> {
    this.deps.logger.debug(`Handle tab fetch: ${tabRequest.tabContext?.tabEntityId}`);
    return {
      tab: {
        type: "continue",
        value: await this.welcomeUserHandler.handleWelcomeTabFetch(context)
      } 
    }
  }

  async onConversationUpdateActivity(context: TurnContext): Promise<void> {
    await this.welcomeUserHandler.handleConversationUpdate(context)
  }
}
