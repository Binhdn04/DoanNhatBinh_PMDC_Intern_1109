import { Transform, Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsEmail,
  IsIn,
  IsInt,
  IsISO8601,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";
const roles = ["STUDENT", "COMPANY_STAFF", "SUPERVISOR", "ADMIN"];
const text = () =>
  Transform(({ value }) => (typeof value === "string" ? value.trim() : value));
export class SignInDto {
  @IsEmail() @MaxLength(320) email!: string;
  @IsString() @Length(1, 128) password!: string;
  @IsOptional() @IsIn(roles) activeRole?: any;
}
export class RoleDto {
  @IsIn(roles) role!: any;
}
export class ProfileDto {
  @IsOptional() @text() @IsString() @MaxLength(200) university?: string;
  @IsOptional() @text() @IsString() @MaxLength(200) major?: string;
  @IsOptional() @IsInt() @Min(1900) @Max(2200) graduationYear?: number;
  @IsOptional() @IsString() @MaxLength(10000) bio?: string;
}
export class SkillDto {
  @IsOptional() @IsUUID() id?: string;
  @IsOptional() @text() @IsString() @Length(1, 100) name?: string;
  @IsOptional()
  @IsIn(["BEGINNER", "INTERMEDIATE", "ADVANCED"])
  proficiency?: string;
  @IsOptional()
  @IsIn(["REQUIRED", "OPTIONAL"])
  importance?: "REQUIRED" | "OPTIONAL";
}
export class SkillsDto {
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => SkillDto)
  skills!: SkillDto[];
}
export class PreferencesDto {
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @MaxLength(200, { each: true })
  industries!: string[];
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @MaxLength(200, { each: true })
  locations!: string[];
  @IsArray()
  @ArrayMaxSize(3)
  @IsIn(["ONSITE", "REMOTE", "HYBRID"], { each: true })
  workArrangements!: string[];
  @IsOptional() @IsInt() @Min(1) @Max(520) minDurationWeeks?: number;
  @IsOptional() @IsInt() @Min(1) @Max(520) maxDurationWeeks?: number;
}
export class PostingDto {
  @IsUUID() companyId!: string;
  @IsOptional() @IsUUID() termId?: string;
  @text() @IsString() @Length(1, 200) title!: string;
  @text() @IsString() @Length(1, 20000) description!: string;
  @IsOptional() @IsString() @MaxLength(100) category?: string;
  @IsOptional() @IsString() @MaxLength(200) location?: string;
  @IsIn(["ONSITE", "REMOTE", "HYBRID"]) workArrangement!: string;
  @IsInt() @Min(1) @Max(520) durationWeeks!: number;
  @IsInt() @Min(1) @Max(10000) openings!: number;
  @IsISO8601({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  applicationDeadline!: string;
  @IsOptional() @IsString() @MaxLength(100) deadlineTimezone?: string;
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => SkillDto)
  skills?: SkillDto[];
}
export class ApplicationDto {
  @IsUUID() postingId!: string;
  @IsUUID() cvDocumentId!: string;
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @ArrayUnique()
  @IsUUID("all", { each: true })
  supportingDocumentIds?: string[];
  @text() @IsString() @Length(1, 20000) coverNote!: string;
  @text() @IsString() @Length(1, 200) contactName!: string;
  @IsEmail() @MaxLength(320) contactEmail!: string;
  @IsOptional() @IsString() @MaxLength(40) contactPhone?: string;
  @text() @IsString() @Length(1, 200) university!: string;
  @text() @IsString() @Length(1, 200) major!: string;
  @IsOptional() @IsInt() @Min(1900) @Max(2200) graduationYear?: number;
  @text() @IsString() @Length(1, 4000) availability!: string;
}
export class TransitionDto {
  @IsIn(["UNDER_REVIEW", "INTERVIEW", "REJECTED", "ACCEPTED"])
  targetStatus!: string;
  @IsOptional() @IsUUID() supervisorUserId?: string;
  @IsOptional()
  @IsISO8601({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  startDate?: string;
  @IsOptional()
  @IsISO8601({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  endDate?: string;
  @IsOptional() @text() @IsString() @MaxLength(4000) note?: string;
}
export class LifecycleDto {
  @IsIn(["CLOSED", "ARCHIVED", "COMPLETED", "TERMINATED"])
  targetStatus!: string;
  @IsOptional() @text() @IsString() @MaxLength(4000) note?: string;
}
export class TaskDto {
  @text() @IsString() @Length(1, 200) title!: string;
  @text() @IsString() @Length(1, 10000) description!: string;
  @IsIn(["LOW", "MEDIUM", "HIGH"]) priority!: string;
  @IsOptional()
  @IsISO8601({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  dueDate?: string;
}
export class TaskStatusDto {
  @IsIn(["TODO", "IN_PROGRESS", "DONE"]) status!: string;
}
export class ReportDto {
  @IsOptional() @IsUUID() reportingPeriodId?: string;
  @IsString() @MaxLength(20000) accomplishments!: string;
  @IsString() @MaxLength(20000) challenges!: string;
  @IsString() @MaxLength(20000) nextWeekPlan!: string;
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(10)
  @IsUUID("all", { each: true })
  attachmentDocumentIds?: string[];
}
export class ReviewDto {
  @IsUUID() reportVersionId!: string;
  @IsIn(["APPROVED", "REVISION_REQUESTED"])
  outcome!: "APPROVED" | "REVISION_REQUESTED";
  @IsOptional() @text() @IsString() @MaxLength(10000) feedback?: string;
}
export class AssessmentDto {
  @IsIn(["DRAFT", "SUBMITTED"]) status!: string;
  @IsObject() ratings!: Record<string, number>;
  @IsOptional() @IsString() @MaxLength(20000) reflection?: string;
  @IsOptional() @IsString() @MaxLength(20000) learningOutcomes?: string;
  @IsOptional() @IsString() @MaxLength(20000) comments?: string;
  @IsOptional()
  @IsIn(["PASSED", "FAILED", "PENDING", "INCOMPLETE"])
  completionDecision?: string;
}
export class AssignmentDto {
  @IsOptional() @IsUUID() expectedAssignmentId?: string | null;
  @IsOptional() @IsUUID() supervisorUserId?: string | null;
  @text() @IsString() @Length(1, 4000) reason!: string;
}
export class DocumentDto {
  @text()
  @IsString()
  @Length(1, 255)
  @Matches(/^[^\r\n\x00]+$/)
  originalName!: string;
  @IsIn([
    "application/pdf",
    "image/jpeg",
    "image/png",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ])
  contentType!: string;
  @IsInt() @Min(1) @Max(10485760) sizeBytes!: number;
  @Matches(/^[a-f0-9]{64}$/i) sha256!: string;
  @IsOptional() @IsIn(["CV", "PORTFOLIO", "TRANSCRIPT", "OTHER"]) kind?: string;
}
export class AiDto {
  @IsIn(["MATCH_EXPLANATION", "REPORT_SUMMARY"])
  kind!: "MATCH_EXPLANATION" | "REPORT_SUMMARY";
  @IsOptional() @IsUUID() postingId?: string;
  @IsOptional() @IsUUID() reportVersionId?: string;
}
export class PageDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page: number = 1;
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize: number = 20;
}
export class PostingQueryDto extends PageDto {
  @IsOptional() @IsString() @MaxLength(200) search?: string;
  @IsOptional() @IsIn(["relevance", "newest", "match_score"]) sort?: string;
  @IsOptional() @IsString() @MaxLength(200) location?: string;
  @IsOptional() @IsIn(["ONSITE", "REMOTE", "HYBRID"]) workArrangement?: string;
}
export class ScopeDto {
  @IsOptional() @IsUUID() programId?: string;
  @IsOptional() @IsUUID() termId?: string;
}
export class SupervisorQueryDto extends PageDto {
  @IsOptional() @IsUUID() applicationId?: string;
  @IsOptional() @IsUUID() placementId?: string;
  @IsOptional() @IsString() @MaxLength(200) search?: string;
}
