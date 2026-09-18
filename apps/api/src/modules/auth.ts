import {
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  AuthSession,
  Role,
  User,
  UserRole,
} from "../infrastructure/database/entities";
export interface Principal {
  id: string;
  sid: string;
  role: Role;
  version: number;
  roles: Role[];
  exp?: number;
}
export const CurrentUser = createParamDecorator(
  (_d: unknown, ctx: ExecutionContext): Principal =>
    ctx.switchToHttp().getRequest().user,
);
export const Roles = (...roles: Role[]) => SetMetadata("roles", roles);
export const Public = () => SetMetadata("public", true);
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    @InjectRepository(AuthSession)
    private readonly sessions: Repository<AuthSession>,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(UserRole)
    private readonly userRoles: Repository<UserRole>,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (Reflect.getMetadata("public", context.getHandler())) return true;
    const req = context.switchToHttp().getRequest();
    const raw = req.headers.authorization?.replace(/^Bearer\s+/i, "");
    if (!raw) throw new UnauthorizedException();
    let payload: Principal;
    try {
      payload = await this.jwt.verifyAsync<Principal>(raw);
    } catch {
      throw new UnauthorizedException();
    }
    const [session, user, roleRows] = await Promise.all([
      this.sessions.findOneBy({ id: payload.sid }),
      this.users.findOneBy({ id: payload.id }),
      this.userRoles.findBy({ userId: payload.id }),
    ]);
    const roles = roleRows.map((x) => x.role);
    if (
      !session ||
      !user ||
      session.userId !== payload.id ||
      !session.expiresAt ||
      session.expiresAt.getTime() <= Date.now() ||
      !payload.exp ||
      payload.exp * 1000 <= Date.now() ||
      session.revokedAt ||
      session.version !== payload.version ||
      session.activeRole !== payload.role ||
      !roles.includes(payload.role)
    )
      throw new UnauthorizedException();
    const required = Reflect.getMetadata("roles", context.getHandler()) as
      Role[] | undefined;
    if (required?.length && !required.includes(payload.role))
      throw new ForbiddenException();
    req.user = { ...payload, roles };
    return true;
  }
}
export function assert(condition: unknown): asserts condition {
  if (!condition) throw new ForbiddenException();
}
