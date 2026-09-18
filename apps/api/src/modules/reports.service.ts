import type { Report } from "../../../../packages/contracts/src";
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, EntityManager, In, Repository } from "typeorm";
import {
  Document,
  Notification,
  Placement,
  ReportDraftDocument,
  ReportReview,
  ReportVersion,
  ReportVersionDocument,
  ReportingPeriod,
  WeeklyReport,
} from "../infrastructure/database/entities";
import { AccessService } from "./access.service";
import { Principal, assert } from "./auth";
import { ReportDto, ReviewDto } from "./dto";
const trim = (value?: string) => value?.trim() || undefined;
@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(ReportingPeriod)
    private periods: Repository<ReportingPeriod>,
    @InjectRepository(WeeklyReport) private reports: Repository<WeeklyReport>,
    @InjectRepository(ReportVersion)
    private versions: Repository<ReportVersion>,
    @InjectRepository(ReportReview) private reviews: Repository<ReportReview>,
    @InjectRepository(ReportDraftDocument)
    private draftDocs: Repository<ReportDraftDocument>,
    private dataSource: DataSource,
    private access: AccessService,
  ) {}

  async listPeriods(p: Principal, id: string) {
    await this.placementAccess(p, id);
    return this.periods.find({
      where: { placementId: id },
      order: { weekStart: "ASC" },
    });
  }
  async listReports(p: Principal, placementId: string) {
    const placement = await this.placementAccess(p, placementId);
    const rows = await this.reports.findBy({ placementId });
    return Promise.all(
      rows
        .filter((r) => p.role === "STUDENT" || r.currentVersionNo > 0)
        .map((r) =>
          this.reportDto(
            r,
            p.role === "STUDENT" && placement.studentId === p.id,
          ),
        ),
    );
  }
  async createDraft(p: Principal, placementId: string, body: ReportDto) {
    const placement = await this.placementAccess(p, placementId);
    assert(placement.studentId === p.id && placement.status === "ACTIVE");
    if (!body.reportingPeriodId)
      throw new BadRequestException("Reporting period is required");
    const period = await this.periods.findOneBy({
      id: body.reportingPeriodId,
      placementId,
    });
    if (
      !period ||
      period.weekStart >
        new Intl.DateTimeFormat("en-CA", {
          timeZone: placement.reportingTimezone,
        }).format(new Date())
    )
      throw new ConflictException("Invalid reporting period");
    const report = await this.dataSource.transaction(async (manager) => {
      const lockedPlacement = await manager
        .getRepository(Placement)
        .createQueryBuilder("p")
        .setLock("pessimistic_write")
        .where("p.id=:id", { id: placementId })
        .getOneOrFail();
      if (lockedPlacement.status !== "ACTIVE")
        throw new ConflictException("Placement ended");
      await manager
        .getRepository(ReportingPeriod)
        .createQueryBuilder("p")
        .setLock("pessimistic_write")
        .where("p.id=:id", { id: period.id })
        .getOneOrFail();
      const aggregate =
        (await manager
          .getRepository(WeeklyReport)
          .findOneBy({ reportingPeriodId: period.id })) ??
        manager.getRepository(WeeklyReport).save({
          placementId,
          reportingPeriodId: period.id,
          state: "DRAFT",
          currentVersionNo: 0,
        });
      return this.saveDraftRecord(await aggregate, body, p, placement, manager);
    });
    return this.reportDto(report, true);
  }
  async getReport(p: Principal, id: string) {
    const report = await this.reports.findOneBy({ id });
    if (!report) throw new NotFoundException();
    const placement = await this.placementAccess(p, report.placementId);
    if (p.role !== "STUDENT" && report.currentVersionNo === 0)
      throw new NotFoundException();
    return this.reportDto(
      report,
      p.role === "STUDENT" && placement.studentId === p.id,
    );
  }
  async patchReport(p: Principal, id: string, body: ReportDto) {
    const report = await this.reports.findOneBy({ id });
    if (!report) throw new NotFoundException();
    const placement = await this.placementAccess(p, report.placementId);
    assert(
      placement.studentId === p.id &&
        placement.status === "ACTIVE" &&
        ["DRAFT", "REVISION_REQUESTED"].includes(report.state),
    );
    return this.saveDraft(report, body, p, placement);
  }
  async submitReport(p: Principal, id: string) {
    const source = await this.reports.findOneBy({ id });
    if (!source) throw new NotFoundException();
    const placement = await this.placementAccess(p, source.placementId);
    assert(placement.studentId === p.id);
    const report = await this.dataSource.transaction(async (manager) => {
      const lockedPlacement = await manager
        .getRepository(Placement)
        .createQueryBuilder("p")
        .setLock("pessimistic_write")
        .where("p.id = :id", { id: placement.id })
        .getOneOrFail();
      const locked = await manager
        .getRepository(WeeklyReport)
        .createQueryBuilder("r")
        .setLock("pessimistic_write")
        .where("r.id = :id", { id })
        .getOneOrFail();
      await this.access.placement(p, placement.id, manager);
      if (
        lockedPlacement.status !== "ACTIVE" ||
        !["DRAFT", "REVISION_REQUESTED"].includes(locked.state)
      )
        throw new ConflictException("REPORT_VERSION_CONFLICT");
      const a = trim(locked.draftAccomplishments),
        c = trim(locked.draftChallenges),
        n = trim(locked.draftNextWeekPlan);
      if (!a || !c || !n)
        throw new BadRequestException("All report fields are required");
      const version = await manager.getRepository(ReportVersion).save({
        reportId: id,
        versionNo: locked.currentVersionNo + 1,
        accomplishments: a,
        challenges: c,
        nextWeekPlan: n,
        submittedByUserId: p.id,
      });
      const links = await manager
        .getRepository(ReportDraftDocument)
        .findBy({ reportId: id });
      if (links.length)
        await manager.getRepository(ReportVersionDocument).save(
          links.map((x) => ({
            reportVersionId: version.id,
            documentId: x.documentId,
          })),
        );
      await manager.getRepository(ReportDraftDocument).delete({ reportId: id });
      Object.assign(locked, {
        state: "SUBMITTED",
        currentVersionNo: version.versionNo,
        draftAccomplishments: null,
        draftChallenges: null,
        draftNextWeekPlan: null,
        draftSavedAt: null,
      });
      return manager.save(locked);
    });
    return this.reportDto(report, true);
  }

  async reviewReport(p: Principal, id: string, body: ReviewDto) {
    const source = await this.reports.findOneBy({ id });
    if (!source) throw new NotFoundException();
    const placement = await this.placementAccess(p, source.placementId);
    if (
      !["APPROVED", "REVISION_REQUESTED"].includes(body.outcome) ||
      (body.outcome === "REVISION_REQUESTED" && !trim(body.feedback))
    )
      throw new BadRequestException("Feedback is required for revision");
    const report = await this.dataSource.transaction(async (manager) => {
      const lockedPlacement = await manager
        .getRepository(Placement)
        .createQueryBuilder("p")
        .setLock("pessimistic_write")
        .where("p.id = :id", { id: placement.id })
        .getOneOrFail();
      const locked = await manager
        .getRepository(WeeklyReport)
        .createQueryBuilder("r")
        .setLock("pessimistic_write")
        .where("r.id = :id", { id })
        .getOneOrFail();
      await this.access.placement(p, placement.id, manager);
      if (lockedPlacement.status !== "ACTIVE" || locked.state !== "SUBMITTED")
        throw new ConflictException("REPORT_VERSION_CONFLICT");
      const version = await manager.getRepository(ReportVersion).findOneBy({
        id: body.reportVersionId,
        reportId: id,
        versionNo: locked.currentVersionNo,
      });
      if (
        !version ||
        (await manager
          .getRepository(ReportReview)
          .exist({ where: { reportVersionId: body.reportVersionId } }))
      )
        throw new ConflictException("REPORT_VERSION_CONFLICT");
      await manager.getRepository(ReportReview).save({
        reportVersionId: version.id,
        outcome: body.outcome,
        feedback: trim(body.feedback),
        reviewedByUserId: p.id,
      });
      locked.state = body.outcome;
      await manager.save(locked);
      await manager.getRepository(Notification).save({
        recipientUserId: lockedPlacement.studentId,
        type:
          body.outcome === "APPROVED"
            ? "REPORT_FEEDBACK"
            : "REPORT_REVISION_REQUESTED",
        title: "Report reviewed",
        targetType: "REPORT",
        targetId: id,
      });
      return locked;
    });
    return this.reportDto(report, false);
  }
  private async saveDraft(
    report: WeeklyReport,
    body: ReportDto,
    p: Principal,
    placement: Placement,
  ) {
    const saved = await this.dataSource.transaction((manager) =>
      this.saveDraftRecord(report, body, p, placement, manager),
    );
    return this.reportDto(saved, true);
  }
  private async saveDraftRecord(
    report: WeeklyReport,
    body: ReportDto,
    p: Principal,
    placement: Placement,
    manager: EntityManager,
  ) {
    const currentPlacement = await manager
      .getRepository(Placement)
      .createQueryBuilder("p")
      .setLock("pessimistic_write")
      .where("p.id=:id", { id: placement.id })
      .getOneOrFail();
    if (currentPlacement.status !== "ACTIVE")
      throw new ConflictException("Placement ended");
    const reports = manager.getRepository(WeeklyReport);
    const locked = await reports
      .createQueryBuilder("r")
      .setLock("pessimistic_write")
      .where("r.id = :id", { id: report.id })
      .getOneOrFail();
    if (!["DRAFT", "REVISION_REQUESTED"].includes(locked.state))
      throw new ConflictException("Report is not editable");
    if (
      body.reportingPeriodId &&
      body.reportingPeriodId !== locked.reportingPeriodId
    )
      throw new BadRequestException("Reporting period is immutable");
    const ids: string[] = body.attachmentDocumentIds ?? [];
    if (new Set(ids).size !== ids.length || ids.length > 10)
      throw new BadRequestException("Invalid attachments");
    const documents = ids.length
      ? await manager
          .getRepository(Document)
          .createQueryBuilder("d")
          .setLock("pessimistic_write")
          .where(
            "d.id IN (:...ids) AND d.owner_user_id=:owner AND d.state=:state",
            { ids, owner: p.id, state: "AVAILABLE" },
          )
          .getMany()
      : [];
    if (documents.length !== ids.length)
      throw new BadRequestException(
        "Attachments must be owned available documents",
      );
    Object.assign(locked, {
      draftAccomplishments: body.accomplishments ?? "",
      draftChallenges: body.challenges ?? "",
      draftNextWeekPlan: body.nextWeekPlan ?? "",
      draftSavedAt: new Date(),
    });
    await reports.save(locked);
    await manager
      .getRepository(ReportDraftDocument)
      .delete({ reportId: locked.id });
    if (ids.length)
      await manager
        .getRepository(ReportDraftDocument)
        .save(ids.map((documentId) => ({ reportId: locked.id, documentId })));
    return locked;
  }
  private async reportDto(report: WeeklyReport, owner: boolean) {
    const period = await this.periods.findOneByOrFail({
      id: report.reportingPeriodId,
    });
    const versions = await this.versions.find({
      where: { reportId: report.id },
      order: { versionNo: "ASC" },
    });
    const reviews = versions.length
      ? await this.reviews.findBy({
          reportVersionId: In(versions.map((x) => x.id)),
        })
      : [];
    const links = versions.length
      ? await this.dataSource
          .getRepository(ReportVersionDocument)
          .findBy({
            reportVersionId: In(versions.map((version) => version.id)),
          })
      : [];
    const dto: Report = {
      id: report.id,
      placementId: report.placementId,
      reportingPeriodId: report.reportingPeriodId,
      weekStart: period.weekStart,
      weekEnd: period.weekEnd,
      dueAt: period.dueAt.toISOString(),
      state: report.state,
      currentVersionNo: report.currentVersionNo,
      versions: versions.map((version) => ({
        ...version,
        submittedAt: version.submittedAt.toISOString(),
        attachmentDocumentIds: links
          .filter((link) => link.reportVersionId === version.id)
          .map((link) => link.documentId),
      })),
      reviews: reviews.map((review) => ({
        ...review,
        reviewedAt: review.reviewedAt.toISOString(),
      })),
    };
    if (owner && report.draftSavedAt)
      dto.draft = {
        reportingPeriodId: report.reportingPeriodId,
        accomplishments: report.draftAccomplishments ?? "",
        challenges: report.draftChallenges ?? "",
        nextWeekPlan: report.draftNextWeekPlan ?? "",
        attachmentDocumentIds: (
          await this.draftDocs.findBy({ reportId: report.id })
        ).map((x) => x.documentId),
      };
    return dto;
  }
  private async placementAccess(p: Principal, id: string) {
    return this.access.placement(p, id);
  }
}
