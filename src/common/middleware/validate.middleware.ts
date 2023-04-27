import { IMiddleware } from "./middleware.interface"
import { NextFunction, Request, Response } from "express"
import { ClassConstructor, plainToClass } from "class-transformer"
import { validate } from "class-validator"
import { StatusCodes } from "http-status-codes"
import { HttpError } from "../errors/http-error"

export class ValidateMiddleware implements IMiddleware {
  constructor(private classToValidate: ClassConstructor<object>) {}

  execute(req: Request, res: Response, next: NextFunction): void {
    const instance = plainToClass(this.classToValidate, req.body)
    validate(instance, { validationError: { target: false } }).then((err) => {
      if (err.length) {
        const errMessage: string[] = []
        err.forEach((e) => {
          for (const key in e.constraints) {
            errMessage.push(e.constraints[key])
          }
        })
        return next(new HttpError(StatusCodes.UNPROCESSABLE_ENTITY, errMessage.join(",")))
      } else {
        return next()
      }
    })
  }
}
