import { ICommentController } from "./comment.controller.interface"
import "reflect-metadata"
import { inject, injectable } from "inversify"
import { BaseController } from "../common/controller/base.controller"
import { TYPES } from "../common/constants/types"
import { ICommentService } from "./comment.service.interface"
import { NextFunction, Request, Response } from "express"
import { GuardMiddleware } from "../common/middleware/guard.middleware"
import { ValidateMiddleware } from "../common/middleware/validate.middleware"
import { CreateCommentDto } from "./dto/create-comment.dto"
import { StatusCodes } from "http-status-codes"
import { Role } from "@prisma/client"
import { ILoggerService } from "../common/logger/logger.service.interface"

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     AccessToken:
 *       type: apiKey
 *       in: header
 *       name: x-access-token
 *   schemas:
 *     Comment:
 *       type: object
 *       required:
 *         - text
 *         - postId
 *       properties:
 *         id:
 *           type: number
 *         text:
 *           type: string
 *         isPublish:
 *           type: boolean
 *         postId:
 *           type: string
 *         userId:
 *           type: string
 *       example:
 *         id: 1
 *         text: something
 *         isPublish: false
 *         postId: 1
 *         userId: 1
 */

@injectable()
export class CommentController extends BaseController implements ICommentController {
  constructor(
    @inject(TYPES.ICommentService) private commentService: ICommentService,
    @inject(TYPES.ILoggerService) private loggerService: ILoggerService,
  ) {
    super(loggerService)
    this.bindRoutes([
      {
        path: "/",
        method: "post",
        func: this.create,
        middlewares: [new GuardMiddleware(), new ValidateMiddleware(CreateCommentDto)],
      },
      {
        path: "/:id",
        method: "delete",
        func: this.delete,
        middlewares: [new GuardMiddleware([Role.ADMIN, Role.MANAGER])],
      },
      { path: "/published/post/:postId", method: "get", func: this.getPublishedCommentsByPostId },
      {
        path: "/unpublished/post/:postId",
        method: "get",
        func: this.getUnpublishedCommentsByPostId,
        middlewares: [new GuardMiddleware([Role.ADMIN, Role.MANAGER])],
      },
      {
        path: "/publish/:id",
        method: "patch",
        func: this.publishComment,
        middlewares: [new GuardMiddleware([Role.ADMIN, Role.MANAGER])],
      },
    ])
  }

  /**
   * @swagger
   * /api/v1/comment:
   *   post:
   *     summary: Create comments
   *     tags: [Comment]
   *     security:
   *       - AccessToken: []
   *     requestBody:
   *       required: true
   *       content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                text:
   *                  type: string
   *                postId:
   *                  type: string
   *              required:
   *                - text
   *                - postId
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *          application/json:
   *           type: object
   *           $ref: '#/components/schemas/Comment'
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.token
      const comment = await this.commentService.create(user, req.body)
      this.send(res, StatusCodes.CREATED, comment)
    } catch (e) {
      return next(e)
    }
  }

  /**
   * @swagger
   * /api/v1/comment/posts/{id}:
   *   delete:
   *     summary: Delete comment by id[ADMIN.MANAGER]
   *     security:
   *       - AccessToken: []
   *     parameters:
   *       - in: path
   *         name: id
   *     tags: [Comment]
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
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const commentId = req.params.id
      await this.commentService.delete(commentId)
      this.ok(res, commentId)
    } catch (e) {
      return next(e)
    }
  }

  /**
   * @swagger
   * /api/v1/comment/published/post/{postId}:
   *   get:
   *     summary: Get published comments by post id
   *     parameters:
   *       - in: path
   *         name: id
   *     tags: [Comment]
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *          application/json:
   *            schema:
   *              type: array
   *              items:
   *                $ref: '#/components/schemas/Comment'
   */
  async getPublishedCommentsByPostId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const postId = req.params.postId
      const comments = await this.commentService.getPublishedCommentsByPostId(postId)
      this.ok(res, comments)
    } catch (e) {
      return next(e)
    }
  }

  /**
   * @swagger
   * /api/v1/comment/unpublished/post/{postId}:
   *   get:
   *     summary: Get unpublished comments by post id[ADMIN,MANAGER]
   *     tags: [Comment]
   *     parameters:
   *       - in: path
   *         name: postId
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *          application/json:
   *            schema:
   *              type: array
   *              items:
   *                $ref: '#/components/schemas/Comment'
   */
  async getUnpublishedCommentsByPostId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const postId = req.params.postId
      const comments = await this.commentService.getUnpublishedCommentsByPostId(postId)
      this.ok(res, comments)
    } catch (e) {
      return next(e)
    }
  }

  /**
   * @swagger
   * /api/v1/comment/{id}:
   *   patch:
   *     summary: Publish comment[ADMIN,MANAGER]
   *     parameters:
   *       - in: path
   *         name: id
   *     tags: [Comment]
   *     responses:
   *       200:
   *         description: Success
   */
  async publishComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const commentId = req.params.id
      await this.commentService.publishComment(commentId)
      this.ok(res)
    } catch (e) {
      return next(e)
    }
  }
}
