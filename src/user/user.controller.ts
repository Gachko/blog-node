import { IUserController } from "./user.controller.interface"
import { inject, injectable } from "inversify"
import "reflect-metadata"
import { TYPES } from "../common/constants/types"
import { IUserService } from "./user.service.interface"
import { BaseController } from "../common/controller/base.controller"
import { NextFunction, Request, Response } from "express"
import { GuardMiddleware } from "../common/middleware/guard.middleware"
import { Role } from "@prisma/client"
import { ValidateMiddleware } from "../common/middleware/validate.middleware"
import { UserUpdateDto } from "./dto/user-update.dto"
import { ILoggerService } from "../common/logger/logger.service.interface"

/**
 *  @swagger
 *  components:
 *    schemas:
 *      User:
 *       type: object
 *       properties:
 *         id:
 *          type: string
 *         name:
 *          type: string
 *         email:
 *          type: string
 *         createdAt:
 *          type: Date
 *         role:
 *          type: string
 *          enum: [ADMIN, USER]
 *         status:
 *          type: string
 *          enum: [ACTIVE, INACTIVE]
 *       example:
 *         id: re124
 *         name: David
 *         email: admin@admin.com
 *         role: ADMIN
 *         createdAt: 2023-03-20T14:26:21.805Z
 *         status: ACTIVE
 */

@injectable()
export class UserController extends BaseController implements IUserController {
  constructor(
    @inject(TYPES.IUserService) private userService: IUserService,
    @inject(TYPES.ILoggerService) private loggerService: ILoggerService,
  ) {
    super(loggerService)
    this.bindRoutes([
      { path: "/", method: "get", func: this.findUsers, middlewares: [new GuardMiddleware([Role.ADMIN])] },
      { path: "/me", method: "get", func: this.findMe, middlewares: [new GuardMiddleware()] },
      {
        path: "/:id",
        method: "patch",
        func: this.editUser,
        middlewares: [new ValidateMiddleware(UserUpdateDto), new GuardMiddleware([Role.ADMIN])],
      },
    ])
  }

  /**
   * @swagger
   * /api/v1/user:
   *   get:
   *     summary: Get all users [ADMIN]
   *     tags: [Users]
   *     security:
   *       - AccessToken: []
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *            schema:
   *              type: array
   *              items:
   *                $ref: '#/components/schemas/User'
   */
  async findUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await this.userService.findUsers()
      this.ok(res, users)
    } catch (e) {
      return next(e)
    }
  }

  /**
   * /**
   *     @swagger
   *     /api/v1/users/{id}:
   *       patch:
   *         summary: Update one user [ADMIN]
   *         tags: [Users]
   *         security:
   *           - AccessToken: []
   *         parameters:
   *           - in: path
   *             name: id
   *             schema:
   *               type: integer
   *             description: User id
   *         requestBody:
   *           required: true
   *           content:
   *              application/json:
   *                schema:
   *                  type: object
   *                  properties:
   *                    role:
   *                      type: string
   *                      enum: [ADMIN, MANAGER, USER]
   *                    status:
   *                       type: string
   *                       enum: [ACTIVE, INACTIVE]
   *         responses:
   *           200:
   *             description: Success
   *           500:
   *             description: Server error
   *    */
  async editUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id
      await this.userService.editUser(req.body, id)
      this.ok(res)
    } catch (e) {
      return next(e)
    }
  }

  /**
   * @swagger
   * /api/v1/user/me:
   *   get:
   *     summary: Get personal data
   *     tags: [Users]
   *     security:
   *       - AccessToken: []
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *            type: object
   *            $ref: '#/components/schemas/User'
   *       404:
   *         description: User not found
   */

  async findMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.token.id
      const me = await this.userService.findMe(id)
      this.ok(res, me)
    } catch (e) {
      return next(e)
    }
  }
}
