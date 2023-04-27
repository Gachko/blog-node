import { NextFunction, Response, Request, Router } from "express"

export interface IUserController {
  router: Router
  findUsers: (req: Request, res: Response, next: NextFunction) => Promise<void>
  findMe: (req: Request, res: Response, next: NextFunction) => Promise<void>
  editUser: (req: Request, res: Response, next: NextFunction) => Promise<void>
}
