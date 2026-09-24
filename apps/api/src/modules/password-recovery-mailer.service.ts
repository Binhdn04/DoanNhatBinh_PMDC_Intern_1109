import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import * as nodemailer from "nodemailer";

@Injectable()
export class PasswordRecoveryMailer {
  private readonly transport = process.env.MAIL_HOST
    ? nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT ?? 587),
        secure: process.env.MAIL_SECURE === "true",
        auth:
          process.env.MAIL_USER && process.env.MAIL_PASSWORD
            ? { user: process.env.MAIL_USER, pass: process.env.MAIL_PASSWORD }
            : undefined,
      })
    : undefined;

  async sendPasswordReset(email: string, token: string): Promise<void> {
    if (!this.transport || !process.env.MAIL_FROM || !process.env.APP_BASE_URL)
      throw new ServiceUnavailableException("Password recovery is unavailable");
    const url = new URL("/reset-password", process.env.APP_BASE_URL);
    url.searchParams.set("token", token);
    await this.transport.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject: "Reset your InternHub password",
      text: `Use this one-time link to reset your InternHub password: ${url.toString()}\nThis link expires in 30 minutes.`,
    });
  }

  async sendEmailVerification(email: string, token: string): Promise<void> {
    if (!this.transport || !process.env.MAIL_FROM || !process.env.APP_BASE_URL)
      throw new ServiceUnavailableException(
        "Email verification is unavailable",
      );
    const url = new URL("/verify-email", process.env.APP_BASE_URL);
    url.searchParams.set("token", token);
    await this.transport.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject: "Verify your InternHub email",
      text: `Use this one-time link to verify your InternHub account: ${url.toString()}\nThis link expires in 24 hours.`,
    });
  }
}
