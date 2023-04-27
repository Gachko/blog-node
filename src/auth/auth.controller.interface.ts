import { NextFunction, Request, Response, Router } from "express"

export interface IAuthController {
  router: Router
  login: (req: Request, res: Response, next: NextFunction) => Promise<void>
  register: (req: Request, res: Response, next: NextFunction) => Promise<void>
  confirm: (req: Request, res: Response, next: NextFunction) => Promise<void>
  restorePassword: (req: Request, res: Response, next: NextFunction) => Promise<void>
  resetPassword: (req: Request, res: Response, next: NextFunction) => Promise<void>
  logout: (req: Request, res: Response, next: NextFunction) => Promise<void>
  token: (req: Request, res: Response, next: NextFunction) => Promise<void>
}
