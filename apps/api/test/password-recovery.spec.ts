import { AuthService } from "../src/modules/auth.service";

describe("password recovery", () => {
  const service = (
    user: object | null,
    send = jest.fn().mockResolvedValue(undefined),
  ) => {
    const users = { findOneBy: jest.fn().mockResolvedValue(user) };
    const tokens = { update: jest.fn(), save: jest.fn() };
    return {
      users,
      tokens,
      send,
      auth: new AuthService(
        users as any,
        { findBy: jest.fn() } as any,
        {} as any,
        tokens as any,
        {} as any,
        { sendPasswordReset: send } as any,
      ),
    };
  };

  it("does not expose whether an account exists", async () => {
    const known = service({
      id: "u1",
      email: "user@example.test",
      isActive: true,
    });
    const missing = service(null);
    await expect(
      known.auth.requestPasswordReset({ email: "user@example.test" }),
    ).resolves.toEqual({ ok: true });
    await expect(
      missing.auth.requestPasswordReset({ email: "missing@example.test" }),
    ).resolves.toEqual({ ok: true });
    expect(known.tokens.save).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "u1" }),
    );
    expect(known.send).toHaveBeenCalledWith(
      "user@example.test",
      expect.any(String),
    );
    expect(missing.tokens.save).not.toHaveBeenCalled();
    expect(missing.send).not.toHaveBeenCalled();
  });

  it("revokes a newly-issued token when delivery fails without changing its public response", async () => {
    const failure = service(
      { id: "u1", email: "user@example.test", isActive: true },
      jest.fn().mockRejectedValue(new Error("smtp unavailable")),
    );
    await expect(
      failure.auth.requestPasswordReset({ email: "user@example.test" }),
    ).resolves.toEqual({ ok: true });
    expect(failure.tokens.update).toHaveBeenCalledTimes(2);
  });

  it("limits repeated reset delivery without revealing whether an email exists", async () => {
    const known = service({
      id: "u1",
      email: "user@example.test",
      isActive: true,
    });
    const missing = service(null);
    for (let i = 0; i < 4; i++) {
      await expect(
        known.auth.requestPasswordReset(
          { email: "user@example.test" },
          { ip: "1" },
        ),
      ).resolves.toEqual({ ok: true });
      await expect(
        missing.auth.requestPasswordReset(
          { email: "missing@example.test" },
          { ip: "2" },
        ),
      ).resolves.toEqual({ ok: true });
    }
    expect(known.tokens.save).toHaveBeenCalledTimes(3);
    expect(known.send).toHaveBeenCalledTimes(3);
    expect(missing.tokens.save).not.toHaveBeenCalled();
  });

  it("allows a reset request after its email limit expires", async () => {
    const known = service({
      id: "u1",
      email: "user@example.test",
      isActive: true,
    });
    const now = Date.now();
    const clock = jest.spyOn(Date, "now").mockReturnValue(now);
    for (let i = 0; i < 3; i++)
      await known.auth.requestPasswordReset(
        { email: "user@example.test" },
        { ip: "1" },
      );
    clock.mockReturnValue(now + 30 * 60 * 1000 + 1);
    await known.auth.requestPasswordReset(
      { email: "user@example.test" },
      { ip: "1" },
    );
    clock.mockRestore();
    expect(known.tokens.save).toHaveBeenCalledTimes(4);
  });

  it("rejects an IP that exceeds the public request limit", async () => {
    const known = service({
      id: "u1",
      email: "user@example.test",
      isActive: true,
    });
    for (let i = 0; i < 10; i++)
      await known.auth.requestPasswordReset(
        { email: `user${i}@example.test` },
        { ip: "1" },
      );
    await expect(
      known.auth.requestPasswordReset(
        { email: "next@example.test" },
        { ip: "1" },
      ),
    ).rejects.toMatchObject({ status: 429 });
  });
});
