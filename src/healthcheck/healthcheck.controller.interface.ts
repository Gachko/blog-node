import { NextFunction, Request, Response, Router } from "express"

export interface IHealthcheckController {
  router: Router
  checkHealth: (req: Request, res: Response, next: NextFunction) => Promise<void>
}
