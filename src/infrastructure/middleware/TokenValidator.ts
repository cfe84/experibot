import * as jwt from "jsonwebtoken";
import * as jwksClient from "jwks-rsa";

const parseJwt = (jwt: string) => {
  if (jwt.startsWith(`Bearer `)) {
    jwt = jwt.substring(7);
  }
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

export class TokenValidator {
  private keyClient: jwksClient.JwksClient
  private issuer: string;
  private audience: string;
  private keyCache: {[kid: string]: string} = {}

  constructor(tenantId: string, private appId: string) {
    const discoveryKeysEndpoint = `https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`;
    this.keyClient = jwksClient({jwksUri: discoveryKeysEndpoint});
    this.audience = appId;
    this.issuer = `https://login.microsoftonline.com/${tenantId}/v2.0`
  }

  async getClaims(token: string) {
    const parsedToken = parseJwt(token);
    return parsedToken.payload;
  }

  async validateJwtAsync(token: string) {
    const key = await this.getKeysAsync(token);
    const valid = this.verifyJwtAsync(token, key);
    if (!valid) {
      throw Error("Forbidden");
    }
  }

  private verifyJwtAsync(token: string, key: string): Promise<boolean> {
    const parsedToken = parseJwt(token);
    const validationOptions = {
      audience: this.audience,
      issuer: `https://login.microsoftonline.com/${parsedToken.payload.tid}/v2.0`
    };
    return new Promise((resolve, reject) => {
      jwt.verify(token, key, validationOptions, (err, res) => {
        if (err) {
          console.error(err)
          reject(err)
        }
        if (res) {
          resolve(true)
        } else {
          resolve(false)
        }
      });
    })
  }

  private getKeysAsync(token: string): Promise<string> {
    const parsedToken = parseJwt(token);
    if (this.keyCache[parsedToken.header.kid]) {
      return Promise.resolve(this.keyCache[parsedToken.header.kid]);
    }
    return new Promise((resolve, reject) => {
      this.keyClient.getSigningKey(parsedToken.header.kid, (err, key) => {
        if (err) {
          reject(err);
        } else if (key) {
          const signingKey = key.getPublicKey();
          this.keyCache[parsedToken.header.kid] = signingKey;
          resolve(signingKey)
        } else {
          reject(`Failed to retrieve signing key.`);
        }
      })
    })
  }
}