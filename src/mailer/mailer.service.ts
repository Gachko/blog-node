import { inject, injectable } from "inversify"
import nodemailer from "nodemailer"
import "reflect-metadata"
import { TYPES } from "../common/constants/types"
import { IConfigService } from "../common/config/config.service.interface"
import { IMailerService } from "./mailer.service.interface"
import pug from "pug"

@injectable()
export class MailerService implements IMailerService {
  transporter: any
  constructor(@inject(TYPES.IConfigService) private configService: IConfigService) {
    this.transporter = nodemailer.createTransport({
      host: String(this.configService.get("HOST_NODEMAILER")),
      port: Number(this.configService.get("HOST_NODEMAILER_PORT")),
      secure: false,
      auth: {
        user: this.configService.get("ROOT_EMAIL"),
        pass: this.configService.get("ROOT_PASSWORD"),
      },
    })
  }

  async confirmEmail(emailTo: string, confirmationCode: string): Promise<void> {
    const url = `${this.configService.get("CLIENT_URL")}/confirm?token=${confirmationCode}`
    await this.transporter.sendMail({
      from: `Admin ${this.configService.get("ROOT_EMAIL")}`,
      to: `${emailTo}`,
      subject: "Please confirm your account",
      html: this.renderTemplate("confirmation-mail", { url }),
    })
  }

  async resetPassword(emailTo: string, confirmationCode: string): Promise<void> {
    const url = `${this.configService.get("CLIENT_URL")}/restore-password?token=${confirmationCode}`
    await this.transporter.sendMail({
      from: `Admin ${this.configService.get("ROOT_EMAIL")}`,
      to: `${emailTo}`,
      subject: "Reset your password",
      html: this.renderTemplate("reset-password-mail", { url }),
    })
  }

  private renderTemplate(templateName: string, data: any) {
    return pug.renderFile(`./src/common/templates/${templateName}.pug`, data)
  }
}
