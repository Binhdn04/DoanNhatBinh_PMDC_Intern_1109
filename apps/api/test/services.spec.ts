import {
  BadRequestException,
  ForbiddenException,
  HttpException,
} from "@nestjs/common";
import { Readable } from "node:stream";
import { assert, SessionGuard } from "../src/modules/auth";
import { ProblemFilter } from "../src/modules/problem.filter";
import { PrivateStorageService } from "../src/modules/private-storage.service";
import { SchedulerHealthService } from "../src/modules/scheduler-health.service";

describe("API services and guards", () => {
  const context = (token?: string, handler = () => undefined) =>
    ({
      getHandler: () => handler,
      switchToHttp: () => ({
        getRequest: () => ({
          headers: token ? { authorization: `Bearer ${token}` } : {},
        }),
      }),
    }) as any;

  it("assert throws forbidden for false", () => {
    expect(() => assert(false)).toThrow(ForbiddenException);
    expect(() => assert(true)).not.toThrow();
  });

  it("accepts a valid active session and rejects missing, invalid and revoked sessions", async () => {
    const jwt = {
      verifyAsync: jest
        .fn()
        .mockResolvedValue({
          id: "u1",
          sid: "s1",
          role: "STUDENT",
          version: 1,
          exp: Math.floor(Date.now() / 1000) + 3600,
        }),
    } as any;
    const sessions = {
      findOneBy: jest
        .fn()
        .mockResolvedValue({
          id: "s1",
          userId: "u1",
          expiresAt: new Date(Date.now() + 3600000),
          version: 1,
          activeRole: "STUDENT",
        }),
    } as any;
    const users = {
      findOneBy: jest.fn().mockResolvedValue({ id: "u1" }),
    } as any;
    const roles = {
      findBy: jest.fn().mockResolvedValue([{ role: "STUDENT" }]),
    } as any;
    const guard = new SessionGuard(jwt, sessions, users, roles);
    await expect(guard.canActivate(context("ok"))).resolves.toBe(true);
    await expect(guard.canActivate(context())).rejects.toMatchObject({
      status: 401,
    });
    jwt.verifyAsync.mockRejectedValueOnce(new Error("bad"));
    await expect(guard.canActivate(context("bad"))).rejects.toMatchObject({
      status: 401,
    });
    sessions.findOneBy.mockResolvedValueOnce({
      version: 1,
      activeRole: "STUDENT",
      revokedAt: new Date(),
    });
    await expect(guard.canActivate(context("revoked"))).rejects.toMatchObject({
      status: 401,
    });
  });

  it("rejects a role not allowed by metadata", async () => {
    const handler = () => undefined;
    jest
      .spyOn(Reflect, "getMetadata")
      .mockImplementation((key: unknown, value: unknown) =>
        key === "roles" && value === handler ? ["ADMIN"] : undefined,
      );
    const guard = new SessionGuard(
      {
        verifyAsync: jest
          .fn()
          .mockResolvedValue({
            id: "u",
            sid: "s",
            role: "STUDENT",
            version: 1,
            exp: Math.floor(Date.now() / 1000) + 3600,
          }),
      } as any,
      {
        findOneBy: jest
          .fn()
          .mockResolvedValue({
            userId: "u",
            expiresAt: new Date(Date.now() + 3600000),
            version: 1,
            activeRole: "STUDENT",
          }),
      } as any,
      { findOneBy: jest.fn().mockResolvedValue({}) } as any,
      { findBy: jest.fn().mockResolvedValue([{ role: "STUDENT" }]) } as any,
    );
    await expect(
      guard.canActivate(context("ok", handler)),
    ).rejects.toMatchObject({ status: 403 });
    jest.restoreAllMocks();
  });

  it("hashes a private stream and delegates storage operations", async () => {
    const service = new PrivateStorageService();
    const client = (service as any).client;
    client.getObject = jest
      .fn()
      .mockResolvedValue(
        Readable.from([Buffer.from("%PDF-"), Buffer.from("body")]),
      );
    await expect(service.verify("key")).resolves.toMatchObject({
      size: 9,
      signature: Buffer.from("%PDF-bod"),
    });
    client.bucketExists = jest.fn().mockResolvedValue(false);
    client.makeBucket = jest.fn();
    await service.onModuleInit();
    expect(client.makeBucket).toHaveBeenCalled();
    client.putObject = jest.fn().mockResolvedValue({ etag: "x" });
    client.statObject = jest.fn().mockResolvedValue({ size: 1 });
    client.removeObject = jest.fn();
    await service.put("key", Buffer.from("x"), "text/plain");
    await service.putStream("stream", Readable.from(["x"]), 1, "text/plain");
    await expect(service.get("key")).resolves.toBeInstanceOf(Readable);
    await expect(service.stat("key")).resolves.toEqual({ size: 1 });
    await service.remove("key");
    expect(client.putObject).toHaveBeenCalledTimes(2);
    expect(client.removeObject).toHaveBeenCalledWith(expect.any(String), "key");
    client.bucketExists.mockRejectedValueOnce(new Error("offline"));
    await expect(service.onModuleInit()).resolves.toBeUndefined();
  });

  it("reports scheduler freshness", () => {
    const health = new SchedulerHealthService();
    expect(health.snapshot().fresh).toBe(false);
    health.success();
    expect(health.snapshot().fresh).toBe(true);
    health.failure();
    expect(health.snapshot().lastError).toBeInstanceOf(Date);
  });

  it("serializes HTTP errors as problem details", () => {
    const send = jest.fn();
    const type = jest.fn().mockReturnValue({ send });
    const status = jest.fn().mockReturnValue({ type });
    const host = {
      switchToHttp: () => ({
        getResponse: () => ({ status }),
        getRequest: () => ({ originalUrl: "/test" }),
      }),
    } as any;
    new ProblemFilter().catch(
      new BadRequestException(["name is required"]),
      host,
    );
    expect(status).toHaveBeenCalledWith(400);
    expect(send.mock.calls[0][0]).toMatchObject({
      status: 400,
      instance: "/test",
      errors: [{ field: "body", message: "name is required" }],
    });
  });
});
