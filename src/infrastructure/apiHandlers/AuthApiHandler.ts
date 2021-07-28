import { Application, Request, Response } from "express";
import { CodeExchange } from "../../domain/CodeExchange";
import { IDependencies } from "../BotActivityHandler";

export class AuthApiHandler {
  constructor(server: Application, private deps: IDependencies) {
    server.post("/api/completeAuth", this.handleCompleteAuth.bind(this));
  }

  handleCompleteAuth(req: Request, res: Response) {
    const mapping = req.body as CodeExchange;
    this.deps.identityManager
      .exchangeNonceToIdentityAsync(
        mapping.nonce,
        mapping.code,
        mapping.callbackUrl
      )
      .then((msa: string) => {
        res.send(msa);
        res.end();
      });
  }

}