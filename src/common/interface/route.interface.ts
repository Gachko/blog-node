import { NextFunction, Request, Response, Router } from "express"
import { IMiddleware } from "../middleware/middleware.interface"

export interface IRoute {
  path: string
  func: (req: Request, res: Response, next: NextFunction) => void
  method: keyof Pick<Router, "get" | "post" | "delete" | "put" | "patch">
  middlewares?: IMiddleware[]
}
