import {
  BadRequestException,
  HttpException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { createHash, randomBytes } from "crypto";
import { IsNull, Repository } from "typeorm";
import {
  AuthSession,
  AuditEvent,
  PasswordResetToken,
  User,
  UserRole,
} from "../infrastructure/database/entities";
import { Principal } from "./auth";
import { PasswordResetDto, PasswordResetRequestDto, SignInDto } from "./dto";
import { PasswordRecoveryMailer } from "./password-recovery-mailer.service";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private users: Repository<User>,
    @InjectRepository(UserRole) private roles: Repository<UserRole>,
    @InjectRepository(AuthSession) private sessions: Repository<AuthSession>,
    @InjectRepository(PasswordResetToken)
    private resetTokens: Repository<PasswordResetToken>,
    private jwt: JwtService,
    private readonly mailer: PasswordRecoveryMailer,
  ) {}
  private readonly attempts = new Map<
    string,
    { count: number; reset: number }
  >();
  private readonly resetIpAttempts = new Map<
    string,
    { count: number; reset: number }
  >();
  private readonly resetEmailAttempts = new Map<
    string,
    { count: number; reset: number }
  >();
  private checkRate(key: string) {
    const now = Date.now();
    for (const [ip, entry] of this.attempts)
      if (entry.reset <= now) this.attempts.delete(ip);
    const entry = this.attempts.get(key) ?? { count: 0, reset: now + 60000 };
    if (
      entry.count >= 10 ||
      (this.attempts.size >= 10000 && !this.attempts.has(key))
    )
      throw new HttpException("Too many sign-in attempts", 429);
    entry.count++;
    this.attempts.set(key, entry);
  }
  private async issue(user: User, session: AuthSession) {
    const roles = (await this.roles.findBy({ userId: user.id })).map(
      (x) => x.role,
    );
    return {
      accessToken: await this.jwt.signAsync(
        {
          id: user.id,
          sid: session.id,
          role: session.activeRole,
          version: session.version,
          roles,
        },
        {
          expiresIn: Math.max(
            1,
            Math.floor((session.expiresAt.getTime() - Date.now()) / 1000),
          ),
        },
      ),
      expiresAt: session.expiresAt,
      tokenType: "Bearer",
      user: { id: user.id, email: user.email, fullName: user.fullName, roles },
      activeRole: session.activeRole,
    };
  }
  async signIn(body: SignInDto, req?: { ip?: string }) {
    this.checkRate(req?.ip ?? "local");
    const user = await this.users.findOneBy({
      email: body.email?.trim().toLowerCase(),
    });
    if (
      !user ||
      !user.isActive ||
      !(await bcrypt.compare(body.password ?? "", user.passwordHash))
    )
      throw new BadRequestException("Invalid email or password");
    const roles = (await this.roles.findBy({ userId: user.id })).map(
      (x) => x.role,
    );
    const activeRole = body.activeRole ?? roles[0];
    if (!roles.includes(activeRole))
      throw new BadRequestException("Role is not assigned");
    return this.issue(
      user,
      await this.sessions.save({
        userId: user.id,
        activeRole,
        version: 1,
        expiresAt: new Date(Date.now() + 604800000),
      }),
    );
  }
  async signOut(p: Principal) {
    await this.sessions.update(p.sid, { revokedAt: new Date() });
    return { ok: true };
  }
  private tokenHash(token: string) {
    return createHash("sha256").update(token).digest("hex");
  }
  private consumeResetLimit(
    attempts: Map<string, { count: number; reset: number }>,
    key: string,
    limit: number,
    windowMs: number,
  ) {
    const now = Date.now();
    for (const [candidate, entry] of attempts)
      if (entry.reset <= now) attempts.delete(candidate);
    const entry = attempts.get(key) ?? { count: 0, reset: now + windowMs };
    if (entry.count >= limit || (attempts.size >= 10000 && !attempts.has(key)))
      return false;
    entry.count++;
    attempts.set(key, entry);
    return true;
  }
  async requestPasswordReset(
    body: PasswordResetRequestDto,
    req?: { ip?: string },
  ) {
    const email = body.email.trim().toLowerCase();
    if (
      !this.consumeResetLimit(
        this.resetIpAttempts,
        req?.ip ?? "local",
        10,
        60000,
      )
    )
      throw new HttpException("Too many password reset requests", 429);
    if (
      !this.consumeResetLimit(this.resetEmailAttempts, email, 3, 30 * 60 * 1000)
    )
      return { ok: true };
    const user = await this.users.findOneBy({
      email,
      isActive: true,
    });
    if (!user) return { ok: true };
    const token = randomBytes(32).toString("base64url");
    const now = new Date();
    await this.resetTokens.update(
      { userId: user.id, usedAt: IsNull(), revokedAt: IsNull() },
      { revokedAt: now },
    );
    await this.resetTokens.save({
      userId: user.id,
      tokenHash: this.tokenHash(token),
      expiresAt: new Date(now.getTime() + 30 * 60 * 1000),
    });
    try {
      await this.mailer.sendPasswordReset(user.email, token);
    } catch {
      await this.resetTokens.update(
        {
          tokenHash: this.tokenHash(token),
          usedAt: IsNull(),
          revokedAt: IsNull(),
        },
        { revokedAt: new Date() },
      );
    }
    return { ok: true };
  }
  async resetPassword(body: PasswordResetDto) {
    const now = new Date();
    const reset = await this.resetTokens.findOne({
      where: {
        tokenHash: this.tokenHash(body.token),
        usedAt: IsNull(),
        revokedAt: IsNull(),
      },
    });
    const user = reset
      ? await this.users.findOneBy({ id: reset.userId })
      : null;
    if (!reset || reset.expiresAt <= now || !user?.isActive)
      throw new UnauthorizedException("Reset link is invalid or expired");
    const passwordHash = await bcrypt.hash(body.password, 12);
    await this.resetTokens.manager.transaction(async (manager) => {
      const current = await manager.getRepository(PasswordResetToken).findOne({
        where: { id: reset.id, usedAt: IsNull(), revokedAt: IsNull() },
        lock: { mode: "pessimistic_write" },
      });
      if (!current || current.expiresAt <= new Date())
        throw new UnauthorizedException("Reset link is invalid or expired");
      await manager.getRepository(User).update(reset.userId, { passwordHash });
      await manager
        .getRepository(PasswordResetToken)
        .update(current.id, { usedAt: new Date() });
      await manager
        .getRepository(AuthSession)
        .update(
          { userId: reset.userId, revokedAt: IsNull() },
          { revokedAt: new Date() },
        );
      await manager.getRepository(AuditEvent).save({
        subjectType: "USER",
        subjectId: reset.userId,
        eventType: "PASSWORD_RESET",
        actorUserId: reset.userId,
        payload: {},
      });
    });
    return { ok: true };
  }
}
