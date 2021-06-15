import { IAuthenticator } from "../domain/IAuthenticator";
import { Tokens } from "../domain/Tokens";
import fetch from "node-fetch";

interface AuthResult {
  access_token: string;
  id_token: string;
  token_type: "Bearer";
  scope: string;
  expires_in: number;
  ext_expires_in: number;
}

const parseJwt = (jwt: string) => {
  const parts = jwt.split(".");
  const b64dec = (str: string) => {
    const binaryData = Buffer.from(str, "base64");
    return binaryData.toString("utf8");
  };
  return {
    header: JSON.parse(b64dec(parts[0])),
    payload: JSON.parse(b64dec(parts[1])),
    signature: parts[2],
  };
};

export class AADAuthenticator implements IAuthenticator {
  constructor(
    private tenantId: string,
    private clientId: string,
    private clientSecret: string
  ) {}
  async exchangeCodeForTokensAsync(
    code: string,
    callbackUrl: string
  ): Promise<Tokens> {
    const url = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`;
    const body = `grant_type=authorization_code&client_id=${this.clientId}&client_secret=${this.clientSecret}&scope=https://graph.microsoft.com/User.Read openid profile email&code=${code}&redirect_uri=${callbackUrl}`;
    const res = await fetch(url, {
      method: "POST",
      body,
      headers: { "content-type": "application/x-www-form-urlencoded" },
    });
    const tokens = (await res.json()) as AuthResult;
    const jwt = parseJwt(tokens.id_token);
    return {
      accessToken: tokens.access_token,
      idToken: jwt,
    };
  }
}
