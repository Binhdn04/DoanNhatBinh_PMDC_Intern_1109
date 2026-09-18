import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import {
  Application,
  Document,
  Notification,
  Placement,
  Posting,
  ReportingPeriod,
  SavedPosting,
  WeeklyReport,
} from "../infrastructure/database/entities";
import { deadlineInstant } from "./calendar";
import { PrivateStorageService } from "./private-storage.service";
import { SchedulerHealthService } from "./scheduler-health.service";
@Injectable()
export class MaintenanceService {
  constructor(
    @InjectRepository(SavedPosting) private saved: Repository<SavedPosting>,
    @InjectRepository(Document) private documents: Repository<Document>,
    @InjectRepository(ReportingPeriod)
    private periods: Repository<ReportingPeriod>,
    private storage: PrivateStorageService,
    private dataSource: DataSource,
    private schedulerHealth: SchedulerHealthService,
  ) {}

  @Cron("0 * * * * *") async scanDeadlines() {
    try {
      await this.performDeadlineScan();
      this.schedulerHealth.success();
    } catch (error) {
      this.schedulerHealth.failure();
      new Logger("DeadlineScheduler").error(
        error instanceof Error ? error.message : "Deadline scan failed",
      );
    }
  }
  private async performDeadlineScan() {
    const now = new Date();
    const periods = await this.periods
      .createQueryBuilder("r")
      .where(
        "r.due_at <= :cutoff AND EXISTS (SELECT 1 FROM placements p WHERE p.id=r.placement_id AND p.status='ACTIVE') AND NOT EXISTS (SELECT 1 FROM weekly_reports w WHERE w.reporting_period_id=r.id AND w.current_version_no>0) AND NOT EXISTS (SELECT 1 FROM notifications n WHERE n.reporting_period_id=r.id AND n.title=CASE WHEN r.due_at<=now() THEN 'Report overdue' ELSE 'Report due soon' END)",
        { cutoff: new Date(now.getTime() + 86400000) },
      )
      .orderBy("r.due_at", "ASC")
      .take(500)
      .getMany();
    for (const period of periods)
      await this.dataSource.transaction(async (manager) => {
        const placement = await manager
          .getRepository(Placement)
          .createQueryBuilder("p")
          .setLock("pessimistic_write")
          .where("p.id = :id", { id: period.placementId })
          .getOne();
        if (!placement || placement.status !== "ACTIVE") return;
        const submitted = await manager
          .getRepository(WeeklyReport)
          .createQueryBuilder("r")
          .where("r.reporting_period_id = :id AND r.current_version_no > 0", {
            id: period.id,
          })
          .getExists();
        const ms = period.dueAt.getTime() - now.getTime();
        if (!submitted && ms <= 86400000) {
          const overdue = ms <= 0;
          const key = `${placement.studentId}:${period.id}:${
            overdue ? "REPORT_OVERDUE" : "REPORT_DUE"
          }`;
          await manager
            .getRepository(Notification)
            .createQueryBuilder()
            .insert()
            .values({
              recipientUserId: placement.studentId,
              type: "DEADLINE",
              title: overdue ? "Report overdue" : "Report due soon",
              targetType: "PLACEMENT",
              targetId: placement.id,
              reportingPeriodId: period.id,
              dedupeKey: key,
            })
            .orIgnore()
            .execute();
        }
      });
    const candidates = await this.saved
      .createQueryBuilder("s")
      .innerJoin(Posting, "p", "p.id=s.posting_id")
      .where(
        "p.status='OPEN' AND ((p.application_deadline+1)::timestamp AT TIME ZONE p.deadline_timezone)>now() AND ((p.application_deadline+1)::timestamp AT TIME ZONE p.deadline_timezone)<now()+interval '1 day'",
      )
      .andWhere(
        "NOT EXISTS(SELECT 1 FROM notifications n WHERE n.dedupe_key=s.student_id::text||':'||p.id::text||':'||p.application_deadline::text||':APPLICATION_DUE')",
      )
      .andWhere(
        "NOT EXISTS(SELECT 1 FROM applications a WHERE a.student_id=s.student_id AND a.posting_id=p.id)",
      )
      .orderBy("s.savedAt", "ASC")
      .take(500)
      .getMany();
    for (const saved of candidates) {
      await this.dataSource.transaction(async (manager) => {
        const fresh = await manager
          .getRepository(Posting)
          .createQueryBuilder("p")
          .setLock("pessimistic_write")
          .where("p.id = :id", { id: saved.postingId })
          .getOne();
        if (
          !fresh ||
          fresh.status !== "OPEN" ||
          deadlineInstant(
            fresh.applicationDeadline,
            fresh.deadlineTimezone,
          ).getTime() <= Date.now()
        )
          return;
        if (
          await manager.getRepository(Application).exist({
            where: { studentId: saved.studentId, postingId: saved.postingId },
          })
        )
          return;
        await manager
          .getRepository(Notification)
          .createQueryBuilder()
          .insert()
          .values({
            recipientUserId: saved.studentId,
            type: "DEADLINE",
            title: "Saved internship closing soon",
            targetType: "POSTING",
            targetId: saved.postingId,
            dedupeKey: `${saved.studentId}:${saved.postingId}:${fresh.applicationDeadline}:APPLICATION_DUE`,
          })
          .orIgnore()
          .execute();
      });
    }
    this.schedulerHealth.success();
  }
  @Cron("0 10 * * * *") async cleanupDocuments() {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const pending = await this.documents
      .createQueryBuilder("d")
      .where(
        "d.storage_deleted_at IS NULL AND ((d.state IN ('PENDING','REJECTED') AND d.created_at < :cutoff) OR d.state='DELETED')",
        {
          cutoff,
        },
      )
      .orderBy("d.created_at", "ASC")
      .take(500)
      .getMany();
    for (const doc of pending)
      await this.dataSource.transaction(async (manager) => {
        const locked = await manager
          .getRepository(Document)
          .createQueryBuilder("d")
          .setLock("pessimistic_write")
          .where("d.id = :id", { id: doc.id })
          .getOne();
        if (
          !locked ||
          !["PENDING", "REJECTED", "DELETED"].includes(locked.state) ||
          (locked.state !== "DELETED" && locked.createdAt >= cutoff)
        )
          return;
        locked.state = "DELETED";
        await manager.save(locked);
        try {
          await this.storage.remove(locked.objectKey);
          await manager
            .getRepository(Document)
            .update(locked.id, { storageDeletedAt: new Date() });
        } catch (error) {
          new Logger("DocumentCleanup").warn(
            "Object deletion failed; will retry",
          );
        }
      });
  }
}
