import {
  ConflictException,
  Injectable,
  ServiceUnavailableException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { DataSource } from "typeorm";
import { AuthSession } from "../infrastructure/database/entities";
import { assert, Principal } from "./auth";
import { RoleDto } from "./dto";
import { PrivateStorageService } from "./private-storage.service";
import { SchedulerHealthService } from "./scheduler-health.service";

@Injectable()
export class IdentityService {
  constructor(
    private db: DataSource,
    private jwt: JwtService,
    private health: SchedulerHealthService,
    private storage: PrivateStorageService,
  ) {}

  async healthcheck() {
    const scheduler = this.health.snapshot();
    const [database, storage] = await Promise.all([
      this.db
        .query("SELECT 1")
        .then(() => true)
        .catch(() => false),
      this.storage.ready(),
    ]);
    const result = {
      status: database && storage && scheduler.fresh ? "ok" : "degraded",
      database,
      storage,
      scheduler,
    };
    if (result.status !== "ok") throw new ServiceUnavailableException(result);
    return result;
  }
  me(p: Principal) {
    return { id: p.id, roles: p.roles, activeRole: p.role };
  }
  async setRole(p: Principal, body: RoleDto) {
    assert(p.roles.includes(body.role));
    return this.db.transaction(async (m) => {
      const s = await m
        .getRepository(AuthSession)
        .createQueryBuilder("s")
        .setLock("pessimistic_write")
        .where("s.id=:id", { id: p.sid })
        .getOneOrFail();
      if (
        s.revokedAt ||
        s.userId !== p.id ||
        s.version !== p.version ||
        s.expiresAt.getTime() <= Date.now()
      )
        throw new ConflictException("Session changed");
      if (s.activeRole !== body.role) {
        s.activeRole = body.role;
        s.version++;
        await m.save(s);
      }
      return {
        activeRole: s.activeRole,
        accessToken: await this.jwt.signAsync(
          {
            id: p.id,
            sid: p.sid,
            role: s.activeRole,
            version: s.version,
            roles: p.roles,
          },
          {
            expiresIn: Math.max(
              1,
              Math.floor((s.expiresAt.getTime() - Date.now()) / 1000),
            ),
          },
        ),
      };
    });
  }
}
