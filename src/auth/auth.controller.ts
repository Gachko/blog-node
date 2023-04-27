import { BaseController } from "../common/controller/base.controller"
import { IAuthController } from "./auth.controller.interface"
import { inject, injectable } from "inversify"
import "reflect-metadata"
import { TYPES } from "../common/constants/types"
import { IAuthService } from "./auth.service.interface"
import { NextFunction, Request, Response } from "express"
import { IConfigService } from "../common/config/config.service.interface"
import { HttpError } from "../common/errors/http-error"
import { StatusCodes } from "http-status-codes"
import { ValidateMiddleware } from "../common/middleware/validate.middleware"
import { UserCreateDto } from "../user/dto/user-create.dto"
import { UserLoginDto } from "./dto/user-login.dto"
import { IUserService } from "../user/user.service.interface"
import { IMailerService } from "../mailer/mailer.service.interface"
import { RestorePasswordDto } from "./dto/restore-password.dto"
import { ResetPasswordDto } from "./dto/reset-password.dto"
import jwt, { JwtPayload } from "jsonwebtoken"
import { ILoggerService } from "../common/logger/logger.service.interface"

@injectable()
export class AuthController extends BaseController implements IAuthController {
  constructor(
    @inject(TYPES.IAuthService) private authService: IAuthService,
    @inject(TYPES.IUserService) private userService: IUserService,
    @inject(TYPES.IConfigService) private configService: IConfigService,
    @inject(TYPES.IMailerService) private mailerService: IMailerService,
    @inject(TYPES.ILoggerService) private loggerService: ILoggerService,
  ) {
    super(loggerService)
    this.bindRoutes([
      { path: "/register", method: "post", func: this.register, middlewares: [new ValidateMiddleware(UserCreateDto)] },
      { path: "/login", method: "post", func: this.login, middlewares: [new ValidateMiddleware(UserLoginDto)] },
      { path: "/confirm", method: "get", func: this.confirm },
      {
        path: "/reset-password",
        method: "post",
        func: this.resetPassword,
        middlewares: [new ValidateMiddleware(ResetPasswordDto)],
      },
      {
        path: "/restore-password",
        method: "post",
        func: this.restorePassword,
        middlewares: [new ValidateMiddleware(RestorePasswordDto)],
      },
      { path: "/logout", method: "get", func: this.logout },
      { path: "/token", method: "get", func: this.token },
    ])
  }

  /**
   * @swagger
   * /api/v1/auth/token:
   *   get:
   *     summary: Returns new access token by refresh token
   *     tags: [Auth]
   *     responses:
   *       200:
   *         description: Access token generated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 jwt:
   *                   type: string
   *       403:
   *         description: Access denied
   */
  async token(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.cookies
      if (!refreshToken) throw new HttpError(StatusCodes.FORBIDDEN, "Access denied")
      const decodedUser = jwt.verify(refreshToken, this.configService.get("JWT_REFRESH_TOKEN_SECRET")) as JwtPayload
      const user = await this.userService.findUserByEmail(decodedUser.email)
      const { token: accessToken } = this.authService.jwtAccessToken(user)
      const { cookie: refreshTokenCookie } = this.authService.jwtRefreshToken(user)
      res.setHeader("Set-Cookie", refreshTokenCookie)
      this.ok(res, { jwt: accessToken })
    } catch (e) {
      return next(e)
    }
  }

  /**
   * @swagger
   * /api/v1/auth/login:
   *   post:
   *     summary: Login user
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                email:
   *                  type: string
   *                password:
   *                  type: string
   *              required:
   *                email
   *                password
   *     responses:
   *       200:
   *         description: Successful user login
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 jwt:
   *                   type: string
   *       404:
   *         description: User is not exist or Invalid Credentials
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await this.authService.loginUser(req.body)
      const { token: accessToken } = this.authService.jwtAccessToken(user)
      const { cookie: refreshTokenCookie } = this.authService.jwtRefreshToken(user)
      res.setHeader("Set-Cookie", refreshTokenCookie)
      this.ok(res, { jwt: accessToken })
    } catch (e) {
      return next(e)
    }
  }

  /**
   * @swagger
   * /api/v1/auth/register:
   *   post:
   *     summary: Register user
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *               name:
   *                 type: string
   *             required:
   *               - email
   *               - password
   *               - name
   *     responses:
   *       200:
   *         description: Email has sent
   *       404:
   *         description: User not found
   *
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await this.authService.createUser(req.body)
      const { token } = this.authService.jwtAccessToken(user)
      await this.mailerService.confirmEmail(req.body.email, token)
      this.ok(res, "Please verify your email")
    } catch (e) {
      return next(e)
    }
  }

  /**
   * @swagger
   * /api/v1/auth/confirm:
   *   get:
   *     summary: Confirm registration
   *     parameters:
   *       - in: query
   *         name: token
   *     tags: [Auth]
   *     responses:
   *       200:
   *         description: Successful registration
   */
  async confirm(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const confirmationCode = req.query.token as string
      await this.authService.confirmUser(confirmationCode)
      this.created(res)
    } catch (e) {
      return next(e)
    }
  }

  /**
   * @swagger
   * /api/v1/auth/reset-password:
   *   post:
   *     summary: Reset user password
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *             required:
   *               email
   *     responses:
   *       200:
   *         description: Password has been reset. Check email
   *       404:
   *         description: User not found
   */
  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const email = req.body.email
      await this.authService.resetPassword(email)
      this.ok(res, "Password has been reset. Check email")
    } catch (e) {
      return next(e)
    }
  }

  /**
   * @swagger
   * /api/v1/auth/restore-password:
   *   post:
   *     summary: Restore user password
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               newPassword:
   *                 type: string
   *               newPasswordRepeat:
   *                 type: string
   *             required:
   *               password1
   *               password2
   *     responses:
   *       200:
   *         description: Password successfully updated
   *       404:
   *         description: User not found
   *       400:
   *         description: The old and new password are the same
   */
  async restorePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { newPassword } = req.body
      const email = req.token.email
      await this.authService.restorePassword(email, newPassword)
      this.ok(res, "Password has updated")
    } catch (e) {
      return next(e)
    }
  }

  /**
   * @swagger
   * /api/v1/auth/logout:
   *   get:
   *     summary: Logout
   *     tags: [Auth]
   *     responses:
   *       200:
   *         description: User successfully signed out
   */
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.clearCookie("refreshToken")
      this.ok(res)
    } catch (e) {
      return next(e)
    }
  }
}
