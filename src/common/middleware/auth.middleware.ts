import { IMiddleware } from "./middleware.interface"
import { NextFunction, Response, Request } from "express"
import jwt from "jsonwebtoken"
import { ITokenPayload } from "../interface/tokenPayload.interface"

export class AuthMiddleware implements IMiddleware {
  constructor(private secret: string) {}

  execute(req: Request, res: Response, next: NextFunction): void {
    const token = req.body.token || req.query.token || req.headers["x-access-token"]
    if (!token) return next()
    try {
      const decoded = jwt.verify(token, this.secret) as ITokenPayload
      req.token = decoded
      return next()
    } catch (err) {
      return next()
    }
  }
}
