import { NextFunction, Request, Response } from "express"
import { StatusCodes } from "http-status-codes"
import { inject, injectable } from "inversify"
import "reflect-metadata"
import { TYPES } from "../common/constants/types"
import { IPostService } from "./posts.service.interface"
import { BaseController } from "../common/controller/base.controller"
import { IPostsController } from "./posts.controller.interface"
import { ValidateMiddleware } from "../common/middleware/validate.middleware"
import { PostCreateDto } from "./dto/post-create.dto"
import { PostUpdateDto } from "./dto/post-update.dto"
import { GuardMiddleware } from "../common/middleware/guard.middleware"
import { Role } from "@prisma/client"
import { ILoggerService } from "../common/logger/logger.service.interface"

/**
 *  @swagger
 *  components:
 *    schemas:
 *     Tag:
 *        type: object
 *        properties:
 *          id:
 *            type: string
 *          title:
 *            type: string
 *          createdAt:
 *            type: Date
 *          updatedAt:
 *            type: Date
 *     example:
 *         id: id1
 *         title: some tag
 *         updatedAt: 2023-03-20T14:26:21.805Z
 *         createdAt: 2023-03-20T14:26:21.805Z
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     AccessToken:
 *       type: apiKey
 *       in: header
 *       name: x-access-token
 *   schemas:
 *     Post:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         text:
 *           type: string
 *         viewsCount:
 *           type: number
 *         tags:
 *           type: array
 *           items:
 *              $ref: '#/components/schemas/Tag'
 *         createdAt:
 *           type: Date
 *         updatedAt:
 *           type: Date
 *       example:
 *         id: id1
 *         title: ''
 *         text: ''
 *         viewsCount: 0
 *         createdAt: 2023-03-20T14:26:21.805Z
 *         updatedAt: 2023-03-20T14:26:21.805Z
 *         tags: []
 */

@injectable()
export class PostController extends BaseController implements IPostsController {
  constructor(
    @inject(TYPES.IPostService) private postService: IPostService,
    @inject(TYPES.ILoggerService) private loggerService: ILoggerService,
  ) {
    super(loggerService)
    this.bindRoutes([
      { path: "/", method: "get", func: this.getPosts },
      { path: "/tag/:id", method: "get", func: this.getPostsByTag },
      {
        path: "/accessible",
        method: "get",
        func: this.getAccessiblePosts,
        middlewares: [new GuardMiddleware([Role.ADMIN, Role.MANAGER])],
      },
      {
        path: "/",
        method: "post",
        func: this.createPost,
        middlewares: [new ValidateMiddleware(PostCreateDto), new GuardMiddleware([Role.ADMIN, Role.MANAGER])],
      },
      { path: "/:id", method: "get", func: this.getPostById },
      {
        path: "/:id",
        method: "delete",
        func: this.deletePostById,
        middlewares: [new GuardMiddleware([Role.ADMIN, Role.MANAGER])],
      },
      {
        path: "/:id",
        method: "patch",
        func: this.editPostById,
        middlewares: [new ValidateMiddleware(PostUpdateDto), new GuardMiddleware([Role.ADMIN, Role.MANAGER])],
      },
    ])
  }

  /**
   * @swagger
   * /api/v1/posts:
   *   get:
   *     summary: Get all posts
   *     tags: [Posts]
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *          application/json:
   *            schema:
   *              type: array
   *              items:
   *                $ref: '#/components/schemas/Post'
   */
  async getPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const posts = await this.postService.getPosts()
      this.send(res, StatusCodes.OK, posts)
    } catch (e) {
      return next(e)
    }
  }

  /**
   * @swagger
   * /api/v1/accessible:
   *   get:
   *     summary: Get accessible posts [ADMIN, MANAGER]
   *     security:
   *       - AccessToken: []
   *     tags: [Posts]
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *          application/json:
   *            schema:
   *              type: array
   *              items:
   *                $ref: '#/components/schemas/Post'
   */
  async getAccessiblePosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.token
      const posts = await this.postService.getAccessiblePosts(user)
      this.send(res, StatusCodes.OK, posts)
    } catch (e) {
      return next(e)
    }
  }

  /**
   * @swagger
   * /api/v1/posts:
   *   post:
   *     summary: Add new post
   *     security:
   *       - AccessToken: []
   *     tags: [Posts]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *            schema:
   *              type: object
   *              properties:
   *                title:
   *                  type: string
   *                text:
   *                  type: string
   *                tags:
   *                  type: array
   *                  items:
   *                    properties:
   *                      id:
   *                        type: string
   *              required:
   *                title
   *                text
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *          application/json:
   *           type: object
   *           $ref: '#/components/schemas/Post'
   *       500:
   *         description: Server error
   */
  async createPost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.token.id
      const post = await this.postService.createPost(req.body, userId)
      this.send(res, StatusCodes.CREATED, post)
    } catch (e) {
      return next(e)
    }
  }

  /**
   * @swagger
   * /api/v1/posts/{id}:
   *   get:
   *     summary: Get post by id
   *     parameters:
   *       - in: path
   *         name: id
   *     tags: [Posts]
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *          application/json:
   *           type: object
   *           $ref: '#/components/schemas/Post'
   *       500:
   *         description: No Post found
   */
  async getPostById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id
      const user = req.token
      const post = await this.postService.getPostById(id, user)
      this.send(res, StatusCodes.OK, post)
    } catch (e) {
      return next(e)
    }
  }

  /**
   * @swagger
   * /api/v1/posts/{id}:
   *   delete:
   *     summary: Delete post by id
   *     security:
   *       - AccessToken: []
   *     parameters:
   *       - in: path
   *         name: id
   *     tags: [Posts]
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *          application/json:
   *            schema:
   *              type: string
   *              example: "id1"
   *       500:
   *         description: Server error
   */
  async deletePostById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.token
      const id = req.params.id
      await this.postService.deletePost(id, user)
      this.send(res, StatusCodes.OK, id)
    } catch (e) {
      return next(e)
    }
  }

  /**
   * @swagger
   * /api/v1posts/{id}:
   *   patch:
   *     summary: Edit post by id
   *     security:
   *       - AccessToken: []
   *     parameters:
   *        - in: path
   *          name: id
   *     tags: [Posts]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *            schema:
   *              type: object
   *              properties:
   *                title:
   *                  type: string
   *                text:
   *                  type: string
   *                tags:
   *                  type: array
   *                  items:
   *                    properties:
   *                      id:
   *                        type: string
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *            type: object
   *            $ref: '#/components/schemas/Post'
   *       500:
   *         description: Server error
   *       422:
   *         description: Invalid data
   */
  async editPostById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.token
      const id = req.params.id
      const editedPost = await this.postService.editPost(id, req.body, user)
      this.send(res, StatusCodes.OK, editedPost)
    } catch (e) {
      return next(e)
    }
  }

  /**
   * @swagger
   * /api/v1/posts/tag/{id}:
   *   get:
   *     summary: Get posts by id
   *     parameters:
   *       - in: path
   *         name: id
   *     tags: [Posts]
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *          application/json:
   *            schema:
   *              type: array
   *              items:
   *                $ref: '#/components/schemas/Post'
   */
  async getPostsByTag(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tagId = req.params.id
      const posts = await this.postService.getPostsByTag(tagId)
      this.send(res, StatusCodes.OK, posts)
    } catch (e) {
      return next(e)
    }
  }
}
