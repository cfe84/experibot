import { Request, Response } from "express";

export type Next = () => void;
export type Middleware = (req: Request, res: Response, next?: Next) => Promise<void> ;