import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { DataSource, EntityManager, IsNull } from "typeorm";
import {
  AuditEvent,
  Company,
  Notification,
  Placement,
  Posting,
  SavedPosting,
  Task,
} from "../infrastructure/database/entities";
import { AccessService } from "./access.service";
import { Principal } from "./auth";
import { deadlineInstant } from "./calendar";
import { LifecycleDto, PageDto, ScopeDto, TaskDto } from "./dto";
@Injectable()
export class WorkflowsService {
  constructor(
    private readonly db: DataSource,
    private readonly access: AccessService,
  ) {}
  private async audit(
    m: EntityManager,
    p: Principal,
    type: string,
    id: string,
    event: string,
  ) {
    await m.getRepository(AuditEvent).save({
      subjectType: type,
      subjectId: id,
      eventType: event,
      actorUserId: p.id,
      payload: {},
    });
  }
  async publish(p: Principal, id: string) {
    return this.db.transaction(async (m) => {
      const posting = await m
        .getRepository(Posting)
        .createQueryBuilder("p")
        .setLock("pessimistic_write")
        .where("p.id=:id", { id })
        .getOne();
      if (!posting) throw new NotFoundException();
      await this.access.company(p, posting.companyId, m);
      if (
        posting.status !== "DRAFT" ||
        !posting.skillsDeclared ||
        !posting.title.trim() ||
        !posting.description.trim() ||
        deadlineInstant(
          posting.applicationDeadline,
          posting.deadlineTimezone,
        ).getTime() <= Date.now()
      )
        throw new ConflictException(
          "Complete a draft with a future deadline and declared skills before publishing",
        );
      posting.status = "OPEN";
      await m.save(posting);
      await this.audit(m, p, "POSTING", id, "POSTING_PUBLISHED");
      return posting;
    });
  }
  async postingLifecycle(p: Principal, id: string, body: LifecycleDto) {
    return this.db.transaction(async (m) => {
      const posting = await m
        .getRepository(Posting)
        .createQueryBuilder("p")
        .setLock("pessimistic_write")
        .where("p.id=:id", { id })
        .getOne();
      if (!posting) throw new NotFoundException();
      await this.access.company(p, posting.companyId, m);
      if (!(
        (posting.status === "OPEN" && body.targetStatus === "CLOSED") ||
        (posting.status === "CLOSED" && body.targetStatus === "ARCHIVED")
      ))
        throw new ConflictException("Invalid posting transition");
      posting.status = body.targetStatus;
      await m.save(posting);
      await this.audit(m, p, "POSTING", id, "POSTING_" + body.targetStatus);
      return posting;
    });
  }
  async placements(p: Principal, page: PageDto) {
    const qb = this.db.getRepository(Placement).createQueryBuilder("p");
    if (p.role === "STUDENT") qb.where("p.student_id=:user", { user: p.id });
    else if (p.role === "SUPERVISOR")
      qb.where(
        "EXISTS (SELECT 1 FROM placement_supervisor_assignments a WHERE a.placement_id=p.id AND a.supervisor_user_id=:user AND a.revoked_at IS NULL)",
        { user: p.id },
      );
    else if (p.role === "COMPANY_STAFF")
      qb.where(
        "EXISTS (SELECT 1 FROM company_staff s WHERE s.company_id=p.company_id AND s.user_id=:user AND s.active)",
        { user: p.id },
      );
    return qb
      .orderBy("p.created_at", "DESC")
      .addOrderBy("p.id", "ASC")
      .skip((page.page - 1) * page.pageSize)
      .take(page.pageSize)
      .getMany();
  }
  placement(p: Principal, id: string) {
    return this.access.placement(p, id);
  }
  async placementLifecycle(p: Principal, id: string, body: LifecycleDto) {
    return this.db.transaction(async (m) => {
      const row = await m
        .getRepository(Placement)
        .createQueryBuilder("p")
        .setLock("pessimistic_write")
        .where("p.id=:id", { id })
        .getOne();
      if (!row) throw new NotFoundException();
      await this.access.placement(p, id, m);
      if (
        row.status !== "ACTIVE" ||
        !["COMPLETED", "TERMINATED"].includes(body.targetStatus)
      )
        throw new ConflictException("Invalid placement transition");
      row.status = body.targetStatus;
      row.endedAt = new Date();
      row.endedByUserId = p.id;
      await m.save(row);
      await this.audit(m, p, "PLACEMENT", id, "PLACEMENT_" + body.targetStatus);
      return row;
    });
  }
  async tasks(p: Principal, id: string, page: PageDto) {
    await this.access.placement(p, id);
    return this.db.getRepository(Task).find({
      where: { placementId: id },
      order: { createdAt: "ASC", id: "ASC" },
      skip: (page.page - 1) * page.pageSize,
      take: page.pageSize,
    });
  }
  async createTask(p: Principal, id: string, body: TaskDto) {
    return this.db.transaction(async (m) => {
      const placement = await m
        .getRepository(Placement)
        .createQueryBuilder("p")
        .setLock("pessimistic_write")
        .where("p.id=:id", { id })
        .getOneOrFail();
      await this.access.placement(p, id, m);
      if (placement.status !== "ACTIVE")
        throw new ConflictException("Placement ended");
      if (
        body.dueDate &&
        body.dueDate <
          new Intl.DateTimeFormat("en-CA", {
            timeZone: placement.reportingTimezone,
          }).format(new Date())
      )
        throw new BadRequestException("Due date must not be in the past");
      const task = await m.getRepository(Task).save({
        placementId: id,
        title: body.title,
        description: body.description,
        priority: body.priority,
        dueDate: body.dueDate,
        createdByUserId: p.id,
        status: "TODO",
      });
      await m.getRepository(Notification).save({
        recipientUserId: placement.studentId,
        type: "TASK_ASSIGNED",
        title: body.title,
        targetType: "PLACEMENT",
        targetId: id,
      });
      await this.audit(m, p, "PLACEMENT", id, "TASK_ASSIGNED");
      return task;
    });
  }
  async taskStatus(
    p: Principal,
    placementId: string,
    id: string,
    status: string,
  ) {
    return this.db.transaction(async (m) => {
      const placement = await m
        .getRepository(Placement)
        .createQueryBuilder("p")
        .setLock("pessimistic_write")
        .where("p.id=:id", { id: placementId })
        .getOneOrFail();
      await this.access.placement(p, placementId, m);
      if (placement.status !== "ACTIVE")
        throw new ConflictException("Placement ended");
      const task = await m.getRepository(Task).findOneBy({ id, placementId });
      if (!task) throw new NotFoundException();
      task.status = status;
      await m.save(task);
      await this.audit(m, p, "PLACEMENT", placementId, "TASK_STATUS_CHANGED");
      return task;
    });
  }
  async notifications(p: Principal, page: PageDto) {
    return this.db.getRepository(Notification).find({
      where: { recipientUserId: p.id },
      order: { createdAt: "DESC", id: "ASC" },
      skip: (page.page - 1) * page.pageSize,
      take: page.pageSize,
    });
  }
  async markRead(p: Principal, id?: string) {
    const result = await this.db
      .getRepository(Notification)
      .update(
        { recipientUserId: p.id, ...(id ? { id } : {}), readAt: IsNull() },
        { readAt: new Date() },
      );
    return { updated: result.affected ?? 0 };
  }
  async unsave(p: Principal, id: string) {
    await this.db
      .getRepository(SavedPosting)
      .delete({ studentId: p.id, postingId: id });
    return { saved: false };
  }
  async companies(p: Principal) {
    const qb = this.db.getRepository(Company).createQueryBuilder("c");
    if (p.role === "COMPANY_STAFF")
      qb.where(
        "EXISTS (SELECT 1 FROM company_staff s WHERE s.company_id=c.id AND s.user_id=:id AND s.active)",
        { id: p.id },
      );
    return qb.orderBy("c.name", "ASC").take(100).getMany();
  }
  async monitoring(scope: ScopeDto) {
    const params = [scope.programId ?? null, scope.termId ?? null];
    const postingScope =
      "SELECT p.id FROM postings p LEFT JOIN academic_terms t ON t.id=p.term_id WHERE ($1::uuid IS NULL OR t.program_id=$1) AND ($2::uuid IS NULL OR p.term_id=$2)";
    const placementScope = `SELECT p.id FROM placements p LEFT JOIN academic_terms t ON t.id=p.term_id WHERE ($1::uuid IS NULL OR t.program_id=$1) AND ($2::uuid IS NULL OR p.term_id=$2)`;
    const aggregate = async (table: string, field: string, where: string) =>
      Object.fromEntries(
        (
          await this.db.query(
            `SELECT ${field} AS status,count(*)::int AS count FROM ${table} WHERE ${where} GROUP BY ${field}`,
            params,
          )
        ).map((r: { status: string; count: number }) => [r.status, r.count]),
      );
    const [
      applications,
      placements,
      tasks,
      reports,
      deadlines,
      recentActivity,
    ] = await Promise.all([
      aggregate("applications", "status", `posting_id IN (${postingScope})`),
      aggregate("placements", "status", `id IN (${placementScope})`),
      aggregate("tasks", "status", `placement_id IN (${placementScope})`),
      aggregate(
        "weekly_reports",
        "state",
        `placement_id IN (${placementScope})`,
      ),
      this.db.query(
        `SELECT r.id AS "reportingPeriodId",r.week_end AS "dueDate",r.due_at AS "dueAt",p.reporting_timezone AS timezone,json_build_object('type','PLACEMENT','id',p.id) AS target,'REPORT' AS kind FROM reporting_periods r JOIN placements p ON p.id=r.placement_id WHERE p.id IN (${placementScope}) AND p.status='ACTIVE' AND NOT EXISTS (SELECT 1 FROM weekly_reports w WHERE w.reporting_period_id=r.id AND w.current_version_no>0) ORDER BY r.due_at LIMIT 100`,
        params,
      ),
      this.db.query(
        `SELECT event_type AS type,occurred_at AS "occurredAt",json_build_object('type',subject_type,'id',subject_id) AS target FROM audit_events WHERE (subject_type='PLACEMENT' AND subject_id IN (${placementScope})) OR (subject_type='POSTING' AND subject_id IN (${postingScope})) ORDER BY occurred_at DESC LIMIT 20`,
        params,
      ),
    ]);
    return {
      scope,
      applications,
      placements,
      tasks,
      reports,
      deadlines,
      recentActivity,
      readOnly: true,
    };
  }
}
