import { ValidationPipe } from "@nestjs/common";
import {
  ApplicationDto,
  PostingDto,
  ProfileDto,
  SkillsDto,
  PreferencesDto,
  TransitionDto,
} from "../src/modules/dto";
const pipe = new ValidationPipe({
  whitelist: true,
  transform: true,
  forbidNonWhitelisted: true,
});
const validate = (metatype: any, value: unknown) =>
  pipe.transform(value, { type: "body", metatype });
describe("HTTP input contracts", () => {
  it.each(["id", "userId", "createdAt", "roles", "status"])(
    "rejects mass assignment of %s",
    async (field) => {
      await expect(
        validate(ProfileDto, { bio: "Hello", [field]: "untrusted" }),
      ).rejects.toMatchObject({ status: 400 });
    },
  );
  it("accepts canonical proficiency and rejects obsolete client values", async () => {
    await expect(
      validate(SkillsDto, {
        skills: [{ name: "React", proficiency: "ADVANCED" }],
      }),
    ).resolves.toMatchObject({
      skills: [{ name: "React", proficiency: "ADVANCED" }],
    });
    for (const proficiency of ["DEVELOPING", "PROFICIENT", "ADMIN"])
      await expect(
        validate(SkillsDto, { skills: [{ name: "React", proficiency }] }),
      ).rejects.toMatchObject({ status: 400 });
  });
  it("rejects malformed posting fields before persistence", async () => {
    await expect(
      validate(PostingDto, {
        companyId: "bad",
        title: " ",
        description: [],
        durationWeeks: -1,
        openings: 0,
        applicationDeadline: "tomorrow",
        skills: [{ name: "React", importance: "fake" }],
      }),
    ).rejects.toMatchObject({ status: 400 });
  });
  it("requires complete applications and unique document IDs", async () => {
    await expect(
      validate(ApplicationDto, { coverNote: " ", cvDocumentId: "bad" }),
    ).rejects.toMatchObject({ status: 400 });
  });
  it("rejects arbitrary preference properties and non-array values", async () => {
    await expect(
      validate(PreferencesDto, {
        industries: "technology",
        locations: [],
        workArrangements: [],
        studentId: "other",
      }),
    ).rejects.toMatchObject({ status: 400 });
  });
  it("uses targetStatus rather than accepting a second transition wire shape", async () => {
    await expect(
      validate(TransitionDto, { status: "ACCEPTED" }),
    ).rejects.toMatchObject({ status: 400 });
    await expect(
      validate(TransitionDto, { targetStatus: "INTERVIEW" }),
    ).resolves.toMatchObject({ targetStatus: "INTERVIEW" });
  });
});
