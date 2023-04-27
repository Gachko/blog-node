import { Response, Router } from "express"
import { StatusCodes } from "http-status-codes"
import "reflect-metadata"
import { injectable } from "inversify"
import { IRoute } from "../interface/route.interface"
import { ILoggerService } from "../logger/logger.service.interface"

@injectable()
export abstract class BaseController {
  private readonly _router: Router

  constructor(private logger: ILoggerService) {
    this._router = Router()
  }

  get router() {
    return this._router
  }

  public send<T>(res: Response, code: number, message?: T): Response {
    if (message) {
      res.type("application/json")
      return res.status(code).json(message)
    }
    return res.status(code).send()
  }

  public ok<T>(res: Response, message?: T): Response {
    return this.send<T>(res, StatusCodes.OK, message)
  }

  public created(res: Response): Response {
    return res.sendStatus(StatusCodes.CREATED)
  }

  protected bindRoutes(routes: IRoute[]): void {
    for (const route of routes) {
      this.logger.log(`[${route.method}] ${route.path}`)
      const middlewares = route.middlewares?.map((middleware) => middleware.execute.bind(middleware))
      const handler = route.func.bind(this)
      const pipeline = middlewares ? [...middlewares, handler] : handler
      this.router[route.method](route.path, pipeline)
    }
  }
}
