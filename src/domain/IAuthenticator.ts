import { Tokens } from "./Tokens";

export interface IAuthenticator {
  exchangeCodeForTokensAsync(
    code: string,
    callbackUrl: string
  ): Promise<Tokens>;
}
