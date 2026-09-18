import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, EntityManager, In, Repository } from "typeorm";
import { resolveSkill } from "./skills";
import {
  Skill,
  StudentPreference,
  StudentProfile,
  StudentSkill,
} from "../infrastructure/database/entities";
import { Principal } from "./auth";
import { PreferencesDto, ProfileDto, SkillsDto } from "./dto";

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(StudentProfile)
    private profiles: Repository<StudentProfile>,
    @InjectRepository(StudentPreference)
    private preferences: Repository<StudentPreference>,
    @InjectRepository(StudentSkill)
    private studentSkills: Repository<StudentSkill>,
    @InjectRepository(Skill) private skills: Repository<Skill>,
    private db: DataSource,
  ) {}

  async profile(p: Principal) {
    return this.ensureProfile(p.id);
  }
  async updateProfile(p: Principal, body: ProfileDto) {
    const x = await this.ensureProfile(p.id);
    Object.assign(x, {
      university: body.university,
      major: body.major,
      graduationYear: body.graduationYear,
      bio: body.bio,
    });
    return this.profiles.save(x);
  }
  async getSkills(p: Principal) {
    return this.skillDtos(p.id);
  }
  async setSkills(p: Principal, body: SkillsDto) {
    return this.db.transaction(async (m) => {
      await this.ensureProfile(p.id, m);
      const input = body.skills ?? [];
      const found = [];
      for (const x of input) found.push(await resolveSkill(x, m));
      if (new Set(found.map((x) => x.id)).size !== found.length)
        throw new BadRequestException("Duplicate skills");
      await m.getRepository(StudentSkill).delete({ studentId: p.id });
      await m.getRepository(StudentSkill).save(
        found.map((s, i) => ({
          studentId: p.id,
          skillId: s.id,
          proficiency: input[i].proficiency?.toUpperCase(),
        })),
      );
      return found.map((s, i) => ({
        id: s.id,
        name: s.name,
        proficiency: input[i].proficiency?.toUpperCase(),
      }));
    });
  }
  async getPreferences(p: Principal) {
    return (
      (await this.preferences.findOneBy({ studentId: p.id })) ??
      this.preferences.save({
        studentId: p.id,
        industries: [],
        locations: [],
        workArrangements: [],
      })
    );
  }
  async setPreferences(p: Principal, body: PreferencesDto) {
    const x =
      (await this.preferences.findOneBy({ studentId: p.id })) ??
      this.preferences.create({
        studentId: p.id,
        industries: [],
        locations: [],
        workArrangements: [],
      });
    Object.assign(x, {
      industries: body.industries,
      locations: body.locations,
      workArrangements: body.workArrangements,
      minDurationWeeks: body.minDurationWeeks,
      maxDurationWeeks: body.maxDurationWeeks,
    });
    if (
      body.minDurationWeeks &&
      body.maxDurationWeeks &&
      body.minDurationWeeks > body.maxDurationWeeks
    )
      throw new BadRequestException("Invalid duration range");
    return this.preferences.save(x);
  }
  private async ensureProfile(userId: string, m?: EntityManager) {
    const r = m?.getRepository(StudentProfile) ?? this.profiles;
    return (await r.findOneBy({ userId })) ?? r.save({ userId });
  }
  private async skillDtos(studentId: string) {
    const links = await this.studentSkills.findBy({ studentId });
    const all = await this.skills.findBy({
      id: In(links.map((x) => x.skillId)),
    });
    return links.map((x) => ({
      id: x.skillId,
      name: all.find((s) => s.id === x.skillId)?.name,
      proficiency: x.proficiency,
    }));
  }
}
