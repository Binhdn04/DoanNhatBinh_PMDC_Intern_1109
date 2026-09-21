import { ServiceUnavailableException } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { PasswordRecoveryMailer } from "../src/modules/password-recovery-mailer.service";

jest.mock("nodemailer", () => ({ createTransport: jest.fn() }));

const mail = nodemailer as jest.Mocked<typeof nodemailer>;
const names = [
  "MAIL_HOST",
  "MAIL_PORT",
  "MAIL_SECURE",
  "MAIL_USER",
  "MAIL_PASSWORD",
  "MAIL_FROM",
  "APP_BASE_URL",
] as const;
const original = Object.fromEntries(
  names.map((name) => [name, process.env[name]]),
);
const resetEnvironment = () => {
  for (const name of names) delete process.env[name];
  mail.createTransport.mockReset();
};

describe("PasswordRecoveryMailer", () => {
  beforeEach(resetEnvironment);
  afterAll(() => {
    for (const name of names) {
      const value = original[name];
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  });

  it("is unavailable without SMTP configuration", async () => {
    await expect(
      new PasswordRecoveryMailer().sendPasswordReset(
        "user@example.test",
        "token",
      ),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(mail.createTransport).not.toHaveBeenCalled();
  });

  it("uses optional SMTP defaults and rejects incomplete sender configuration", async () => {
    process.env.MAIL_HOST = "smtp.example.test";
    const sendMail = jest.fn();
    mail.createTransport.mockReturnValue({ sendMail } as any);
    const service = new PasswordRecoveryMailer();
    expect(mail.createTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        host: "smtp.example.test",
        port: 587,
        secure: false,
        auth: undefined,
      }),
    );
    await expect(
      service.sendPasswordReset("user@example.test", "token"),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it("configures authenticated SMTP and sends an encoded reset link", async () => {
    Object.assign(process.env, {
      MAIL_HOST: "smtp.example.test",
      MAIL_PORT: "465",
      MAIL_SECURE: "true",
      MAIL_USER: "mailer",
      MAIL_PASSWORD: "secret",
      MAIL_FROM: "InternHub <mail@example.test>",
      APP_BASE_URL: "https://internhub.example/app",
    });
    const sendMail = jest.fn().mockResolvedValue(undefined);
    mail.createTransport.mockReturnValue({ sendMail } as any);
    const service = new PasswordRecoveryMailer();
    expect(mail.createTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        port: 465,
        secure: true,
        auth: { user: "mailer", pass: "secret" },
      }),
    );
    await service.sendPasswordReset("user@example.test", "a token&value");
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: process.env.MAIL_FROM,
        to: "user@example.test",
        text: expect.stringContaining(
          "https://internhub.example/reset-password?token=a+token%26value",
        ),
      }),
    );
  });
});
