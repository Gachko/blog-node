import { NextFunction, Request, Response, Router } from "express"

export interface IPostsController {
  router: Router
  getPosts: (req: Request, res: Response, next: NextFunction) => Promise<void>
  getPostsByTag: (req: Request, res: Response, next: NextFunction) => Promise<void>
  getAccessiblePosts: (req: Request, res: Response, next: NextFunction) => Promise<void>
  editPostById: (req: Request, res: Response, next: NextFunction) => Promise<void>
  createPost: (req: Request, res: Response, next: NextFunction) => Promise<void>
  getPostById: (req: Request, res: Response, next: NextFunction) => Promise<void>
  deletePostById: (req: Request, res: Response, next: NextFunction) => Promise<void>
}
