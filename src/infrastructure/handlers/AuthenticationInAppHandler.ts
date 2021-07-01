import { TurnContext, TaskModuleResponse } from "botbuilder";
import { IDependencies } from "../BotActivityHandler";

export class AuthenticationHandler {

  constructor(private deps: IDependencies) { }

  fetchAuthenticationTaskModule(context: TurnContext): TaskModuleResponse {
    const nonce = this.deps.identityManager.generateNonce(
      context.activity?.from?.id
    );
    return {
      task: {
        type: "continue",
        value: {
          title: "This is the task module title",
          height: 500,
          width: "medium",
          url: `${process.env.BaseUrl}/auth/index.html?userid=${context.activity?.from?.id}&nonce=${nonce}`,
          fallbackUrl: process.env.BaseUrl + "/auth/index.html",
        },
      },
    };
  }
}