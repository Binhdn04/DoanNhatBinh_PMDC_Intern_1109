import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { DataSource, EntityManager, IsNull } from "typeorm";
import {
  Application,
  CompanyStaff,
  Placement,
  Posting,
  SupervisorAssignment,
} from "../infrastructure/database/entities";
import { Principal } from "./auth";
@Injectable()
export class AccessService {
  constructor(private readonly db: DataSource) {}
  async company(
    p: Principal,
    companyId: string,
    manager: EntityManager = this.db.manager,
  ) {
    if (p.role === "ADMIN") return;
    if (
      p.role !== "COMPANY_STAFF" ||
      !(await manager
        .getRepository(CompanyStaff)
        .existsBy({ companyId, userId: p.id, active: true }))
    )
      throw new ForbiddenException();
  }
  async placement(
    p: Principal,
    id: string,
    manager: EntityManager = this.db.manager,
  ) {
    const row = await manager.getRepository(Placement).findOneBy({ id });
    if (!row) throw new NotFoundException();
    if (p.role === "ADMIN" || (p.role === "STUDENT" && row.studentId === p.id))
      return row;
    if (p.role === "SUPERVISOR") {
      if (
        !(await manager.getRepository(SupervisorAssignment).existsBy({
          placementId: id,
          supervisorUserId: p.id,
          revokedAt: IsNull(),
        }))
      )
        throw new ForbiddenException();
    } else await this.company(p, row.companyId, manager);
    return row;
  }
  async application(
    p: Principal,
    id: string,
    manager: EntityManager = this.db.manager,
  ) {
    const row = await manager.getRepository(Application).findOneBy({ id });
    if (!row) throw new NotFoundException();
    if (p.role === "ADMIN" || (p.role === "STUDENT" && row.studentId === p.id))
      return row;
    if (p.role === "SUPERVISOR") {
      const placement = await manager
        .getRepository(Placement)
        .findOneBy({ applicationId: id });
      if (!placement) throw new ForbiddenException();
      await this.placement(p, placement.id, manager);
    } else {
      const posting = await manager
        .getRepository(Posting)
        .findOneByOrFail({ id: row.postingId });
      await this.company(p, posting.companyId, manager);
    }
    return row;
  }
}
