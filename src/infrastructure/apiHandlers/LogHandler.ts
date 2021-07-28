import { Application, Request, Response } from "express";

export class LogHandler {
  constructor(server: Application) {
    server.post("/api/logs/log", this.handleLog.bind(this));
    server.post("/api/logs/error", this.handleError.bind(this));
  }

  handleLog(req: Request, res: Response) {
    const message = req.body;
    console.log(message)
    res.end();
  }

  handleError(req: Request, res: Response) {
    const error = req.body;
    console.error(error)
    res.end();
  }
}