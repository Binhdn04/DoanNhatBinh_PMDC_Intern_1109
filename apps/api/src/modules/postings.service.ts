import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, EntityManager, In, Repository } from "typeorm";
import { normalizeCanonicalSkill } from "../infrastructure/database/canonical-backfill";
import {
  Company,
  Posting,
  PostingSkill,
  SavedPosting,
  Skill,
  StudentSkill,
} from "../infrastructure/database/entities";
import { AccessService } from "./access.service";
import { Principal } from "./auth";
import { deadlineInstant } from "./calendar";
import { calculateMatchScore } from "./core-domain";
import { PostingDto, PostingQueryDto } from "./dto";

@Injectable()
export class PostingsService {
  constructor(
    @InjectRepository(StudentSkill)
    private studentSkills: Repository<StudentSkill>,
    @InjectRepository(Skill) private skills: Repository<Skill>,
    @InjectRepository(Company) private companies: Repository<Company>,
    @InjectRepository(Posting) private postings: Repository<Posting>,
    @InjectRepository(PostingSkill)
    private postingSkills: Repository<PostingSkill>,
    @InjectRepository(SavedPosting) private saved: Repository<SavedPosting>,
    private db: DataSource,
    private access: AccessService,
  ) {}

  async postingsList(
    p: Principal,
    query: PostingQueryDto = new PostingQueryDto(),
  ) {
    const qb = this.postings.createQueryBuilder("p");
    if (p.role === "COMPANY_STAFF")
      qb.where(
        "p.company_id IN (SELECT company_id FROM company_staff WHERE user_id=:user AND active)",
        { user: p.id },
      );
    else if (p.role !== "ADMIN")
      qb.where(
        "p.status='OPEN' AND ((p.application_deadline + 1)::timestamp AT TIME ZONE p.deadline_timezone)>now()",
      );
    if (query.search)
      for (const [i, word] of query.search.trim().split(/\s+/).entries())
        qb.andWhere(
          `(p.title ILIKE :word${i} OR EXISTS (SELECT 1 FROM companies c WHERE c.id=p.company_id AND c.name ILIKE :word${i}) OR EXISTS (SELECT 1 FROM posting_skills ps JOIN skills s ON s.id=ps.skill_id WHERE ps.posting_id=p.id AND s.name ILIKE :word${i}))`,
          { [`word${i}`]: `%${word}%` },
        );
    if (query.location)
      qb.andWhere("p.location=:location", { location: query.location });
    if (query.workArrangement)
      qb.andWhere("p.work_arrangement=:arrangement", {
        arrangement: query.workArrangement,
      });
    if (p.role === "STUDENT" && query.sort !== "newest") {
      qb.addSelect(
        `COALESCE((SELECT floor(100.0*sum(CASE WHEN ss.skill_id IS NOT NULL THEN CASE ps.importance WHEN 'REQUIRED' THEN 2 ELSE 1 END ELSE 0 END)/NULLIF(sum(CASE ps.importance WHEN 'REQUIRED' THEN 2 ELSE 1 END),0)+0.5) FROM posting_skills ps LEFT JOIN student_skills ss ON ss.skill_id=ps.skill_id AND ss.student_id=:student WHERE ps.posting_id=p.id),0)`,
        "match_sort",
      ).setParameter("student", p.id);
      if (query.sort !== "match_score")
        qb.addSelect(
          `COALESCE((SELECT (CASE WHEN p.location=ANY(pref.locations) THEN 1 ELSE 0 END)+(CASE WHEN p.work_arrangement=ANY(pref.work_arrangements) THEN 1 ELSE 0 END)+(CASE WHEN (pref.min_duration_weeks IS NOT NULL OR pref.max_duration_weeks IS NOT NULL) AND (pref.min_duration_weeks IS NULL OR p.duration_weeks>=pref.min_duration_weeks) AND (pref.max_duration_weeks IS NULL OR p.duration_weeks<=pref.max_duration_weeks) THEN 1 ELSE 0 END)+(CASE WHEN EXISTS(SELECT 1 FROM companies c WHERE c.id=p.company_id AND c.industry=ANY(pref.industries)) THEN 1 ELSE 0 END) FROM student_preferences pref WHERE pref.student_id=:student),0)`,
          "relevance_sort",
        ).orderBy("relevance_sort", "DESC");
      qb.addOrderBy("match_sort", "DESC");
    }
    const rows = await qb
      .addOrderBy("p.created_at", "DESC")
      .addOrderBy("p.id", "ASC")
      .skip((query.page - 1) * query.pageSize)
      .take(query.pageSize)
      .getMany();
    const links = rows.length
      ? await this.postingSkills.findBy({
          postingId: In(rows.map((x) => x.id)),
        })
      : [];
    const vocabulary = links.length
      ? await this.skills.findBy({ id: In(links.map((x) => x.skillId)) })
      : [];
    const owned =
      p.role === "STUDENT"
        ? await this.studentSkills.findBy({ studentId: p.id })
        : [];
    return rows.map((row) => {
      const skills = links
        .filter((x) => x.postingId === row.id)
        .map((x) => ({
          id: x.skillId,
          name: vocabulary.find((v) => v.id === x.skillId)?.name ?? "",
          importance: x.importance,
        }));
      return {
        ...row,
        skills,
        ...(p.role === "STUDENT"
          ? {
              match: calculateMatchScore(
                owned.map((x) => x.skillId),
                skills,
              ),
            }
          : {}),
      };
    });
  }
  async listCompanies() {
    return this.companies.find({ take: 100, order: { name: "ASC" } });
  }
  async company(id: string) {
    const c = await this.companies.findOneBy({ id });
    if (!c) throw new NotFoundException();
    return c;
  }
  async getPosting(p: Principal, id: string) {
    const x = await this.postings.findOneBy({ id });
    if (!x) throw new NotFoundException();
    if (x.status === "DRAFT") await this.companyAccess(p, x.companyId);
    return this.postingDto(x, p.role === "STUDENT" ? p.id : undefined);
  }
  async createPosting(p: Principal, body: PostingDto) {
    await this.companyAccess(p, body.companyId);
    const deadlineTimezone = body.termId
      ? (
          await this.db.query(
            "SELECT coalesce(t.timezone,p.timezone) AS timezone FROM academic_terms t JOIN programs p ON p.id=t.program_id WHERE t.id=$1",
            [body.termId],
          )
        )[0]?.timezone
      : "Asia/Ho_Chi_Minh";
    if (!deadlineTimezone)
      throw new BadRequestException("Unknown academic term");
    try {
      deadlineInstant(body.applicationDeadline, deadlineTimezone);
    } catch {
      throw new BadRequestException("Invalid timezone");
    }
    return this.db.transaction(async (m) => {
      const posting = await m.getRepository(Posting).save({
        companyId: body.companyId,
        termId: body.termId,
        title: body.title,
        description: body.description,
        category: body.category,
        location: body.location,
        workArrangement: body.workArrangement,
        durationWeeks: body.durationWeeks,
        openings: body.openings,
        applicationDeadline: body.applicationDeadline,
        deadlineTimezone: deadlineTimezone,
        status: "DRAFT",
        skillsDeclared: body.skills !== undefined,
        createdByUserId: p.id,
      });
      await this.replacePostingSkills(posting.id, body.skills ?? [], m);
      return { ...posting, skills: body.skills ?? [] };
    });
  }
  async savePosting(p: Principal, id: string) {
    const posting = await this.postings.findOneBy({ id });
    if (
      !posting ||
      posting.status !== "OPEN" ||
      deadlineInstant(
        posting.applicationDeadline,
        posting.deadlineTimezone,
      ).getTime() <= Date.now()
    )
      throw new NotFoundException();
    await this.saved.upsert({ studentId: p.id, postingId: id }, [
      "studentId",
      "postingId",
    ]);
    return { saved: true };
  }
  private async companyAccess(
    p: Principal,
    companyId: string,
    m?: EntityManager,
  ) {
    return this.access.company(p, companyId, m);
  }
  private async resolveSkill(
    x: { id?: string; name?: string },
    m: EntityManager,
  ) {
    if (x.id) {
      const e = await m.getRepository(Skill).findOneBy({ id: x.id });
      if (e) return e;
      throw new BadRequestException("Unknown skill");
    }
    const normalizedName = normalizeCanonicalSkill(x.name);
    if (!normalizedName) throw new BadRequestException("Invalid skill");
    const r = m.getRepository(Skill);
    await r
      .createQueryBuilder()
      .insert()
      .values({
        name: x.name!.normalize("NFKC").trim().replace(/\s+/gu, " "),
        normalizedName,
      })
      .orIgnore()
      .execute();
    return r.findOneByOrFail({ normalizedName });
  }
  private async replacePostingSkills(
    postingId: string,
    input: PostingDto["skills"],
    m: EntityManager,
  ) {
    input = input ?? [];
    if (input.some((x) => !x.importance))
      throw new BadRequestException("Skill importance required");
    const found = [];
    for (const x of input) found.push(await this.resolveSkill(x, m));
    if (new Set(found.map((x) => x.id)).size !== found.length)
      throw new BadRequestException("Duplicate skills");
    await m.getRepository(PostingSkill).delete({ postingId });
    if (found.length)
      await m.getRepository(PostingSkill).save(
        found.map((x, i) => ({
          postingId,
          skillId: x.id,
          importance: input![i].importance!,
        })),
      );
  }
  private async postingDto(posting: Posting, studentId?: string) {
    const links = await this.postingSkills.findBy({ postingId: posting.id });
    const all = await this.skills.findBy({
      id: In(links.map((x) => x.skillId)),
    });
    const skills = links.map((x) => ({
      id: x.skillId,
      name: all.find((s) => s.id === x.skillId)?.name ?? "",
      importance: x.importance,
    }));
    return studentId
      ? {
          ...posting,
          skills,
          match: calculateMatchScore(
            (await this.studentSkills.findBy({ studentId })).map(
              (x) => x.skillId,
            ),
            skills,
          ),
        }
      : { ...posting, skills };
  }
}
