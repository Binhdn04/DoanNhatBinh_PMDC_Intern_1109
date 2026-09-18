import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  PerformanceEvaluation,
  SelfAssessment,
} from "../infrastructure/database/entities";
import { AccessService } from "./access.service";
import { Principal, assert } from "./auth";
import { AssessmentDto } from "./dto";
const trim = (value?: string) => value?.trim() || undefined;
const validRatings = (ratings: unknown, required: boolean) =>
  typeof ratings === "object" &&
  ratings !== null &&
  !Array.isArray(ratings) &&
  (!required || Object.keys(ratings as object).length > 0) &&
  Object.values(ratings as object).every(
    (x) => Number.isInteger(x) && Number(x) >= 1 && Number(x) <= 5,
  );
@Injectable()
export class AssessmentsService {
  constructor(
    @InjectRepository(SelfAssessment)
    private selfAssessments: Repository<SelfAssessment>,
    @InjectRepository(PerformanceEvaluation)
    private evaluations: Repository<PerformanceEvaluation>,
    private access: AccessService,
  ) {}

  async getSelf(p: Principal, id: string) {
    const placement = await this.placementAccess(p, id);
    const row = await this.selfAssessments.findOneBy({ placementId: id });
    if (!row) throw new NotFoundException();
    if (p.role === "STUDENT") {
      assert(placement.studentId === p.id);
      return row;
    }
    if (!["SUPERVISOR", "ADMIN"].includes(p.role) || row.status !== "SUBMITTED")
      throw new NotFoundException();
    return row;
  }

  async putSelf(p: Principal, id: string, body: AssessmentDto) {
    const placement = await this.placementAccess(p, id);
    assert(placement.studentId === p.id);
    if (
      !["DRAFT", "SUBMITTED"].includes(body.status) ||
      !validRatings(body.ratings ?? {}, body.status === "SUBMITTED") ||
      (body.status === "SUBMITTED" &&
        (!trim(body.reflection) || !trim(body.learningOutcomes)))
    )
      throw new BadRequestException("Invalid assessment");
    let row = await this.selfAssessments.findOneBy({ placementId: id });
    row = Object.assign(
      row ?? this.selfAssessments.create({ placementId: id }),
      {
        status: body.status,
        ratings: body.ratings ?? {},
        reflection: trim(body.reflection),
        learningOutcomes: trim(body.learningOutcomes),
        submittedAt: body.status === "SUBMITTED" ? new Date() : null,
      },
    );
    return this.selfAssessments.save(row);
  }

  async getEvaluation(p: Principal, id: string) {
    await this.placementAccess(p, id);
    const row = await this.evaluations.findOneBy({ placementId: id });
    if (!row) throw new NotFoundException();
    return row;
  }

  async putEvaluation(p: Principal, id: string, body: AssessmentDto) {
    await this.placementAccess(p, id);
    if (
      !["DRAFT", "SUBMITTED"].includes(body.status) ||
      !["PASSED", "FAILED", "PENDING", "INCOMPLETE"].includes(
        body.completionDecision ?? "",
      ) ||
      !validRatings(body.ratings ?? {}, body.status === "SUBMITTED")
    )
      throw new BadRequestException("Invalid evaluation");
    let row = await this.evaluations.findOneBy({ placementId: id });
    if (row && row.authorUserId !== p.id && p.role !== "ADMIN")
      throw new ConflictException("Evaluation author mismatch");
    row = Object.assign(
      row ?? this.evaluations.create({ placementId: id, authorUserId: p.id }),
      {
        status: body.status,
        ratings: body.ratings ?? {},
        comments: trim(body.comments),
        completionDecision: body.completionDecision,
        submittedAt: body.status === "SUBMITTED" ? new Date() : null,
      },
    );
    return this.evaluations.save(row);
  }
  private async placementAccess(p: Principal, id: string) {
    return this.access.placement(p, id);
  }
}
