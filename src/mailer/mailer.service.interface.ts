export interface IMailerService {
  confirmEmail: (emailTo: string, confirmationCode: string) => Promise<void>
  resetPassword: (emailTo: string, confirmationCode: string) => Promise<void>
}
