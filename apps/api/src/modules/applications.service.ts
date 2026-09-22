import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, EntityManager, Repository } from "typeorm";
import {
  Application,
  ApplicationDocument,
  ApplicationHistory,
  Document,
  Notification,
  Placement,
  Posting,
  ReportingPeriod,
  SupervisorAssignment,
  SupervisorProfile,
  UserRole,
} from "../infrastructure/database/entities";
import { AccessService } from "./access.service";
import { Principal } from "./auth";
import { deadlineInstant, reportingPeriods } from "./calendar";
import {
  AcceptanceCommand,
  Application as ApplicationAggregate,
  ApplicationStatus,
} from "./core-domain";
import { ApplicationDto, PageDto, TransitionDto } from "./dto";

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application) private apps: Repository<Application>,
    @InjectRepository(ApplicationHistory)
    private history: Repository<ApplicationHistory>,
    private db: DataSource,
    private access: AccessService,
  ) {}

  async apply(p: Principal, b: ApplicationDto) {
    const required = [
      "coverNote",
      "contactName",
      "contactEmail",
      "university",
      "major",
      "availability",
    ] as const;
    if (required.some((x) => !String(b[x] ?? "").trim()) || !b.cvDocumentId)
      throw new BadRequestException("Application is incomplete");
    return this.db.transaction(async (m) => {
      const posting = await m
        .getRepository(Posting)
        .createQueryBuilder("p")
        .setLock("pessimistic_write")
        .where("p.id=:id", { id: b.postingId })
        .getOne();
      if (
        !posting ||
        posting.status !== "OPEN" ||
        deadlineInstant(
          posting.applicationDeadline,
          posting.deadlineTimezone,
        ).getTime() <= Date.now()
      )
        throw new ConflictException("Posting unavailable");
      const ids = [
        ...new Set([b.cvDocumentId, ...(b.supportingDocumentIds ?? [])]),
      ];
      const docs = await m
        .getRepository(Document)
        .createQueryBuilder("d")
        .setLock("pessimistic_write")
        .where(
          "d.id IN (:...ids) AND d.owner_user_id=:owner AND d.state=:state",
          { ids, owner: p.id, state: "AVAILABLE" },
        )
        .getMany();
      if (docs.length !== ids.length)
        throw new BadRequestException("Documents must be owned and available");
      if (
        await m
          .getRepository(Application)
          .existsBy({ studentId: p.id, postingId: b.postingId })
      )
        throw new ConflictException("Already applied");
      const app = await m.getRepository(Application).save({
        studentId: p.id,
        postingId: b.postingId,
        cvDocumentId: b.cvDocumentId,
        coverNote: b.coverNote.trim(),
        contactName: b.contactName.trim(),
        contactEmail: b.contactEmail.trim(),
        contactPhone: b.contactPhone?.trim(),
        university: b.university.trim(),
        major: b.major.trim(),
        graduationYear: b.graduationYear,
        availability: b.availability.trim(),
      });
      if (b.supportingDocumentIds?.length)
        await m.getRepository(ApplicationDocument).save(
          b.supportingDocumentIds.map((documentId: string) => ({
            applicationId: app.id,
            documentId,
            kind: "SUPPORTING",
          })),
        );
      await m.getRepository(ApplicationHistory).save({
        applicationId: app.id,
        toStatus: "SUBMITTED",
        actorUserId: p.id,
      });
      return app;
    });
  }
  async applications(p: Principal, page: PageDto) {
    const qb = this.apps.createQueryBuilder("a");
    if (p.role === "STUDENT") qb.where("a.student_id=:user", { user: p.id });
    else if (p.role === "COMPANY_STAFF")
      qb.where(
        "EXISTS (SELECT 1 FROM postings p JOIN company_staff s ON s.company_id=p.company_id WHERE p.id=a.posting_id AND s.user_id=:user AND s.active)",
        { user: p.id },
      );
    else if (p.role === "SUPERVISOR")
      qb.where(
        "EXISTS (SELECT 1 FROM placements p JOIN placement_supervisor_assignments s ON s.placement_id=p.id WHERE p.application_id=a.id AND s.supervisor_user_id=:user AND s.revoked_at IS NULL)",
        { user: p.id },
      );
    return qb
      .orderBy("a.submitted_at", "DESC")
      .addOrderBy("a.id", "ASC")
      .skip((page.page - 1) * page.pageSize)
      .take(page.pageSize)
      .getMany();
  }
  async application(p: Principal, id: string) {
    const app = await this.apps.findOneBy({ id });
    if (!app) throw new NotFoundException();
    await this.access.application(p, id);
    return {
      ...app,
      history: await this.history.find({
        where: { applicationId: id },
        order: { changedAt: "ASC" },
      }),
    };
  }

  async accept(p: Principal, id: string, b: TransitionDto) {
    if (b.targetStatus !== "ACCEPTED")
      return this.transition(p, id, b.targetStatus, b.note);
    const command = AcceptanceCommand.create({
      supervisorUserId: b.supervisorUserId,
      startDate: b.startDate,
      endDate: b.endDate,
      note: b.note,
    });
    if (!command) throw new BadRequestException("Invalid acceptance");
    return this.db.transaction(async (m) => {
      const app = await m
        .getRepository(Application)
        .createQueryBuilder("a")
        .setLock("pessimistic_write")
        .where("a.id=:id", { id })
        .getOne();
      if (!app) throw new NotFoundException();
      const posting = await m
        .getRepository(Posting)
        .findOneByOrFail({ id: app.postingId });
      await this.companyAccess(p, posting.companyId, m);
      const existing = await m
        .getRepository(Placement)
        .findOneBy({ applicationId: id });
      const accepted = await m
        .getRepository(ApplicationHistory)
        .findOneBy({ applicationId: id, toStatus: "ACCEPTED" });
      const aggregate = ApplicationAggregate.rehydrate(
        app.status as ApplicationStatus,
      );
      const acceptance = aggregate.accept(
        command,
        AcceptanceCommand.fromStored(accepted?.acceptanceCommand),
      );
      if (acceptance === "REPLAY") {
        if (existing) return { application: app, placement: existing };
        throw new ConflictException("ACCEPTANCE_CONFLICT");
      }
      if (acceptance === "ACCEPTANCE_CONFLICT")
        throw new ConflictException("ACCEPTANCE_CONFLICT");
      if (acceptance !== "ACCEPTED")
        throw new ConflictException("Invalid application transition");
      if (
        !(await m.getRepository(UserRole).exist({
          where: { userId: command.supervisorUserId, role: "SUPERVISOR" },
        })) ||
        !(await m
          .getRepository(SupervisorProfile)
          .exist({ where: { userId: command.supervisorUserId } }))
      )
        throw new BadRequestException("Supervisor is not eligible");
      app.status = aggregate.status;
      await m.save(app);
      await m.getRepository(ApplicationHistory).save({
        applicationId: id,
        fromStatus: "INTERVIEW",
        toStatus: "ACCEPTED",
        actorUserId: p.id,
        note: command.note ?? undefined,
        acceptanceCommand: command.toData(),
      });
      const placement = await m.getRepository(Placement).save({
        applicationId: id,
        studentId: app.studentId,
        postingId: posting.id,
        companyId: posting.companyId,
        termId: posting.termId,
        startDate: command.startDate,
        endDate: command.endDate,
        status: "ACTIVE",
        reportingTimezone: posting.deadlineTimezone,
      });
      await m.getRepository(SupervisorAssignment).save({
        placementId: placement.id,
        supervisorUserId: command.supervisorUserId,
        assignedByUserId: p.id,
        reason: command.note ?? undefined,
      });
      await m
        .getRepository(ReportingPeriod)
        .save(
          reportingPeriods(
            command.startDate,
            command.endDate,
            placement.reportingTimezone,
          ).map((x) => ({ placementId: placement.id, ...x })),
        );
      await m.getRepository(Notification).save({
        recipientUserId: app.studentId,
        type: "APPLICATION_STATUS_CHANGED",
        title: "Application accepted",
        targetType: "PLACEMENT",
        targetId: placement.id,
      });
      return { application: app, placement };
    });
  }
  private async transition(
    p: Principal,
    id: string,
    target: string,
    note?: string,
  ) {
    return this.db.transaction(async (m) => {
      const app = await m
        .getRepository(Application)
        .createQueryBuilder("a")
        .setLock("pessimistic_write")
        .where("a.id=:id", { id })
        .getOne();
      if (!app) throw new NotFoundException();
      await this.access.application(p, id, m);
      const aggregate = ApplicationAggregate.rehydrate(
        app.status as ApplicationStatus,
      );
      if (
        !aggregate.transitionTo(
          target as ApplicationStatus,
          p.role === "STUDENT" ? "student" : "staff",
        )
      )
        throw new ConflictException("Invalid application transition");
      const previous = app.status;
      app.status = aggregate.status;
      await m.save(app);
      await m.getRepository(ApplicationHistory).save({
        applicationId: id,
        fromStatus: previous,
        toStatus: target,
        actorUserId: p.id,
        note,
      });
      await m.getRepository(Notification).save({
        recipientUserId: app.studentId,
        type: "APPLICATION_STATUS_CHANGED",
        title: `Application ${target.toLowerCase()}`,
        targetType: "APPLICATION",
        targetId: id,
      });
      return app;
    });
  }
  withdraw(p: Principal, id: string) {
    return this.transition(p, id, "WITHDRAWN");
  }
  private async companyAccess(
    p: Principal,
    companyId: string,
    m?: EntityManager,
  ) {
    return this.access.company(p, companyId, m);
  }
}
