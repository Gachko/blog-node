import { NextFunction, Request, Response, Router } from "express"

export interface ITagController {
  router: Router
  createTag: (req: Request, res: Response, next: NextFunction) => Promise<void>
  getTagById: (req: Request, res: Response, next: NextFunction) => Promise<void>
  deleteTagById: (req: Request, res: Response, next: NextFunction) => Promise<void>
  getTags: (req: Request, res: Response, next: NextFunction) => Promise<void>
}
