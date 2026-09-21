import { AuthService } from "../src/modules/auth.service";
import { HttpException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
it("rejects unassigned roles and wrong credentials, throttles repeated attempts and resets the window", async () => {
  const hash = await bcrypt.hash("correct", 4);
  const users = {
    findOneBy: jest.fn().mockResolvedValue({
      id: "u",
      email: "u@test",
      passwordHash: hash,
      isActive: true,
    }),
  };
  const roles = { findBy: jest.fn().mockResolvedValue([{ role: "STUDENT" }]) };
  const service = new AuthService(
    users as any,
    roles as any,
    {} as any,
    {} as any,
    {} as any,
    {} as any,
  );
  await expect(
    service.signIn(
      { email: "u@test", password: "correct", activeRole: "ADMIN" },
      { ip: "1" },
    ),
  ).rejects.toThrow("Role is not assigned");
  for (let i = 0; i < 10; i++)
    await expect(
      service.signIn({ email: "u@test", password: "wrong" }, { ip: "2" }),
    ).rejects.toThrow("Invalid email");
  await expect(
    service.signIn({ email: "u@test", password: "wrong" }, { ip: "2" }),
  ).rejects.toMatchObject({ status: 429 });
  const now = Date.now();
  const clock = jest.spyOn(Date, "now").mockReturnValue(now + 61000);
  await expect(
    service.signIn({ email: "u@test", password: "wrong" }, { ip: "2" }),
  ).rejects.toThrow("Invalid email");
  clock.mockRestore();
  users.findOneBy.mockResolvedValue(null);
  await expect(
    service.signIn({ email: "missing@test", password: "wrong" }),
  ).rejects.toBeInstanceOf(HttpException);
});
