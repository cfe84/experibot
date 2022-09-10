import { Application, Request, Response } from "express";
import { ILogger } from "../../domain/ILogger";
import { UserInfo } from "../../domain/UserInfo";
import { Middleware } from "../middleware/Middleware";

export interface INativeAuthApiHandlerDeps {
  logger: ILogger;
  authMiddleware: Middleware
}

export class NativeAuthApiHandler {
  constructor(server: Application, private deps: INativeAuthApiHandlerDeps) {
    server.get("/api/users/me", deps.authMiddleware, this.handleValidateAuth.bind(this));
  }

  handleValidateAuth(req: Request, res: Response) {
    const userInfo: UserInfo = (req as any).userInfo;
    res.statusCode = 200;
    res.json(userInfo);
    res.end();
  }

}