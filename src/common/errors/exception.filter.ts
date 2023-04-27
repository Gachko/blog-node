import { NextFunction, Request, Response } from "express"
import { StatusCodes } from "http-status-codes"
import { injectable } from "inversify"
import "reflect-metadata"
import { IExceptionFilter } from "./exception.filter.interface"
import { HttpError } from "./http-error"

@injectable()
export class ExceptionFilter implements IExceptionFilter {
  catch(err: Error | HttpError, req: Request, res: Response, _: NextFunction) {
    if (err instanceof HttpError) {
      res.status(err.statusCode).json({ err: `${err.message}` })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ err: err.message })
    }
  }
}
