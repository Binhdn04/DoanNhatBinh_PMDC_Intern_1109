import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import {
  AiJob,
  Application,
  ApplicationDocument,
  ApplicationHistory,
  AuditEvent,
  AuthSession,
  Company,
  CompanyStaff,
  Document,
  Notification,
  PerformanceEvaluation,
  Placement,
  Posting,
  PostingSkill,
  ReportDraftDocument,
  ReportReview,
  ReportVersion,
  ReportVersionDocument,
  ReportingPeriod,
  SavedPosting,
  SelfAssessment,
  Skill,
  StudentDocument,
  StudentPreference,
  StudentProfile,
  StudentSkill,
  SupervisorAssignment,
  SupervisorProfile,
  Task,
  User,
  UserRole,
  WeeklyReport,
} from "../infrastructure/database/entities";
import { AccessService } from "./access.service";
import { AdvancedController } from "./advanced.controller";
import { AiService } from "./ai.service";
import { ApplicationsService } from "./applications.service";
import { AssessmentsService } from "./assessments.service";
import { SessionGuard } from "./auth";
import { AuthService } from "./auth.service";
import { AuthController, CoreController } from "./controllers";
import { DocumentsService } from "./documents.service";
import { IdentityService } from "./identity.service";
import { MaintenanceService } from "./maintenance.service";
import { PostingsService } from "./postings.service";
import { PrivateStorageService } from "./private-storage.service";
import { ProfilesService } from "./profiles.service";
import { ReportsService } from "./reports.service";
import { SchedulerHealthService } from "./scheduler-health.service";
import { SupervisorsService } from "./supervisors.service";
import { WorkflowsController } from "./workflows.controller";
import { WorkflowsService } from "./workflows.service";
@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserRole,
      AuthSession,
      StudentProfile,
      StudentPreference,
      StudentSkill,
      Skill,
      Company,
      CompanyStaff,
      Posting,
      PostingSkill,
      SavedPosting,
      Application,
      ApplicationDocument,
      ApplicationHistory,
      Placement,
      Task,
      Notification,
      Document,
      StudentDocument,
      SupervisorProfile,
      SupervisorAssignment,
      ReportingPeriod,
      WeeklyReport,
      ReportVersion,
      ReportReview,
      ReportDraftDocument,
      ReportVersionDocument,
      SelfAssessment,
      PerformanceEvaluation,
      AuditEvent,
      AiJob,
    ]),
  ],
  controllers: [
    WorkflowsController,
    AuthController,
    CoreController,
    AdvancedController,
  ],
  providers: [
    AuthService,
    IdentityService,
    ProfilesService,
    PostingsService,
    ApplicationsService,
    SupervisorsService,
    DocumentsService,
    ReportsService,
    AssessmentsService,
    AiService,
    MaintenanceService,
    AccessService,
    WorkflowsService,
    PrivateStorageService,
    SchedulerHealthService,
    { provide: APP_GUARD, useClass: SessionGuard },
  ],
})
export class ApiModule {}
