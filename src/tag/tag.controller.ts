import { BaseController } from "../common/controller/base.controller"
import { ITagController } from "./tag.controller.interface"
import { inject, injectable } from "inversify"
import "reflect-metadata"
import { ValidateMiddleware } from "../common/middleware/validate.middleware"
import { NextFunction, Request, Response } from "express"
import { TagCreateDTO } from "./dto/create-tag.dto"
import { TYPES } from "../common/constants/types"
import { ITagService } from "./tag.service.interface"
import { StatusCodes } from "http-status-codes"
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

@injectable()
export class TagController extends BaseController implements ITagController {
  constructor(
    @inject(TYPES.ITagService) private tagService: ITagService,
    @inject(TYPES.ILoggerService) private loggerService: ILoggerService,
  ) {
    super(loggerService)
    this.bindRoutes([
      { path: "/", method: "get", func: this.getTags },
      {
        path: "/",
        method: "post",
        func: this.createTag,
        middlewares: [new ValidateMiddleware(TagCreateDTO), new GuardMiddleware([Role.ADMIN])],
      },
      {
        path: "/:id",
        method: "get",
        func: this.getTagById,
        middlewares: [new GuardMiddleware([Role.ADMIN, Role.MANAGER])],
      },
      { path: "/:id", method: "delete", func: this.deleteTagById, middlewares: [new GuardMiddleware([Role.ADMIN])] },
    ])
  }

  /**
   * @swagger
   * /api/v1/tag:
   *   post:
   *     summary: Add new tag [ADMIN]
   *     security:
   *       - AccessToken: []
   *     tags: [Tag]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *            schema:
   *              type: object
   *              properties:
   *                title:
   *                  type: string
   *              required:
   *                title
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *            application/json:
   *              type: object
   *              $ref: '#/components/schemas/Tag'
   *       500:
   *         description: Server error
   *       409:
   *         description: Tag already exists
   */
  async createTag(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tag = await this.tagService.createTag(req.body)
      this.send(res, StatusCodes.CREATED, tag)
    } catch (e) {
      return next(e)
    }
  }

  /**
   * @swagger
   * /api/v1/tag/{id}:
   *   get:
   *     summary: Get tag by id [ADMIN, MANAGER]
   *     security:
   *       - AccessToken: []
   *     parameters:
   *       - in: path
   *         name: id
   *     tags: [Tag]
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *          application/json:
   *           type: object
   *           $ref: '#/components/schemas/Tag'
   *       500:
   *         description: No Tag found
   */
  async getTagById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tag = await this.tagService.getTagById(req.params.id)
      this.send(res, StatusCodes.OK, tag)
    } catch (e) {
      return next(e)
    }
  }

  /**
   * @swagger
   * /api/v1/tag/{id}:
   *   delete:
   *     summary: Delete tag by id [ADMIN]
   *     security:
   *       - AccessToken: []
   *     parameters:
   *       - in: path
   *         name: id
   *     tags: [Tag]
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
  async deleteTagById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id
      await this.tagService.deleteTagById(id)
      this.send(res, StatusCodes.OK, id)
    } catch (e) {
      return next(e)
    }
  }

  /**
   * @swagger
   * /api/v1/tag:
   *   get:
   *     summary: Get all tags [ADMIN, MANAGER]
   *     tags: [Tag]
   *     security:
   *       - AccessToken: []
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *          application/json:
   *            schema:
   *              type: array
   *              items:
   *                $ref: '#/components/schemas/Tag'
   */
  async getTags(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tags = await this.tagService.getTags()
      this.send(res, StatusCodes.OK, tags)
    } catch (e) {
      return next(e)
    }
  }
}
