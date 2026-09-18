import { BadRequestException, HttpException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { Repository } from "typeorm";
import {
  AuthSession,
  User,
  UserRole,
} from "../infrastructure/database/entities";
import { Principal } from "./auth";
import { SignInDto } from "./dto";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private users: Repository<User>,
    @InjectRepository(UserRole) private roles: Repository<UserRole>,
    @InjectRepository(AuthSession) private sessions: Repository<AuthSession>,
    private jwt: JwtService,
  ) {}
  private readonly attempts = new Map<
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
}
