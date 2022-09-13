import { TokenValidator } from "./TokenValidator";
import { Request, Response } from "express";
import { Middleware, Next } from "./Middleware";
import { ILogger } from "../../domain/ILogger";
import { UserInfo } from "../../domain/UserInfo";

export function AuthenticationMiddleware(logger: ILogger, tokenValidator: TokenValidator): Middleware {
  return async function(req: Request, res: Response, next?: Next) {
    let token = req.headers.authorization;
    logger.debug(`[Auth middleware] Validating token`)
    if (!token) {
      logger.error(`[Auth middleware] Unauthorized`);
      res.statusCode = 401;
      res.end(`Unauthorized`);
      return;
    }
    if (token && token.startsWith("Bearer ")) {
      token = token.substring(7);
    }
    try {
      await tokenValidator.validateJwtAsync(token);
    } catch(error: any) {
      logger.error(`[Auth middleware] Caught validation error: ${error.message}`);
      if (error.message === "Forbidden") {
        res.statusCode = 403;
        res.end(`Forbidden`);
      } else {
        res.statusCode = 400;
        res.end(`Malformed token`);
      }
      return;
    }
    const claims = await tokenValidator.getClaims(token);
    const userInfo: UserInfo = {
      aadObjectId: claims.oid,
      username: claims.preferred_username,
      tenantId: claims.tid
    };
    logger.debug(`[Auth middleware] Validation passed for ${userInfo.username}`);
    (req as any).userInfo = userInfo;
    if (next) {
      next();
    }
  }
}