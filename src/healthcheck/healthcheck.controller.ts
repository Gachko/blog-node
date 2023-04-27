import "reflect-metadata"
import { IHealthcheckController } from "./healthcheck.controller.interface"
import { inject, injectable } from "inversify"
import { BaseController } from "../common/controller/base.controller"
import { ILoggerService } from "../common/logger/logger.service.interface"
import { TYPES } from "../common/constants/types"
import { NextFunction, Request, Response } from "express"

interface IHealthCheck {
  [key: string]: any
}

@injectable()
export class HealthcheckController extends BaseController implements IHealthcheckController {
  constructor(@inject(TYPES.ILoggerService) private loggerService: ILoggerService) {
    super(loggerService)
    this.bindRoutes([{ path: "/", method: "get", func: this.checkHealth }])
  }

  async checkHealth(req: Request, res: Response, next: NextFunction): Promise<void> {
    const healthcheck: IHealthCheck = {
      uptime: process.uptime(),
      responseTime: process.hrtime(),
      message: "OK",
      timestamp: Date.now(),
    }
    try {
      res.send(healthcheck)
    } catch (e) {
      return next(e)
    }
  }
}
