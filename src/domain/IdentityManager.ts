import { v4 as uuid } from "uuid";
import { IAuthenticator } from "./IAuthenticator";

interface IIdentityManagerDependencies {
  authenticator: IAuthenticator;
}

export class IdentityManager {
  constructor(private deps: IIdentityManagerDependencies) { }

  // Store a mapping between nonce and MRI
  private nonceMapping: { [nonce: string]: string } = {};
  // Store a mapping between user id and MRI
  private identityMapping: { [nonce: string]: string } = {};
  // Store a mapping between user id and MRI
  private upnMapping: { [nonce: string]: string } = {};

  generateNonce(userId: string): string {
    const nonce = uuid();
    this.nonceMapping[nonce] = userId;
    return nonce;
  }

  async exchangeNonceToIdentityAsync(
    nonce: string,
    code: string,
    callbackUrl: string
  ): Promise<string> {
    const userId = this.nonceMapping[nonce];
    if (!userId) {
      throw Error(`Nonce not found: ${nonce}`);
    }
    const tokens = await this.deps.authenticator.exchangeCodeForTokensAsync(
      code,
      callbackUrl
    );
    this.identityMapping[userId] = tokens.idToken.payload.email;
    return this.identityMapping[userId];
  }

  getIdentityFromUserId(userId: string): string | undefined {
    return this.identityMapping[userId];
  }
}
