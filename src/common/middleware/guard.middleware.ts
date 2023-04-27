import { IMiddleware } from "./middleware.interface"
import { NextFunction, Request, Response } from "express"
import { HttpError } from "../errors/http-error"
import { StatusCodes } from "http-status-codes"
import { Role } from "@prisma/client"

export class GuardMiddleware implements IMiddleware {
  constructor(private roles: Role[] = []) {}
  execute(req: Request, res: Response, next: NextFunction) {
    if (!req.token) {
      return next(new HttpError(StatusCodes.FORBIDDEN, "User not authorized"))
    }
    if (this.roles.length && !this.roles.includes(req?.token?.role)) {
      return next(new HttpError(StatusCodes.FORBIDDEN, "No permissions"))
    }
    return next()
  }
}
