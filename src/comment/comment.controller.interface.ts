import { NextFunction, Router, Request, Response } from "express"

export interface ICommentController {
  router: Router
  create: (req: Request, res: Response, next: NextFunction) => Promise<void>
  delete: (req: Request, res: Response, next: NextFunction) => Promise<void>
  getPublishedCommentsByPostId: (req: Request, res: Response, next: NextFunction) => Promise<void>
  getUnpublishedCommentsByPostId: (req: Request, res: Response, next: NextFunction) => Promise<void>
  publishComment: (req: Request, res: Response, next: NextFunction) => Promise<void>
}
