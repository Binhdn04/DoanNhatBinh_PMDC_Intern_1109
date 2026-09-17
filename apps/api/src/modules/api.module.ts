import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiJob, Application, ApplicationDocument, ApplicationHistory, AuditEvent, AuthSession, Company, CompanyStaff, Document, Notification, PerformanceEvaluation, Placement, Posting, PostingSkill, ReportDraftDocument, ReportReview, ReportVersion, ReportVersionDocument, ReportingPeriod, SavedPosting, SelfAssessment, Skill, StudentDocument, StudentPreference, StudentProfile, StudentSkill, SupervisorAssignment, SupervisorProfile, Task, User, UserRole, WeeklyReport } from '../infrastructure/database/entities';
import { SessionGuard } from './auth';
import { AuthController, CoreController } from './controllers';
import { AdvancedController } from './advanced.controller';
import { PrivateStorageService } from './private-storage.service';
import { SchedulerHealthService } from './scheduler-health.service';
@Module({ imports: [TypeOrmModule.forFeature([User, UserRole, AuthSession, StudentProfile, StudentPreference, StudentSkill, Skill, Company, CompanyStaff, Posting, PostingSkill, SavedPosting, Application, ApplicationDocument, ApplicationHistory, Placement, Task, Notification, Document, StudentDocument, SupervisorProfile, SupervisorAssignment, ReportingPeriod, WeeklyReport, ReportVersion, ReportReview, ReportDraftDocument, ReportVersionDocument, SelfAssessment, PerformanceEvaluation, AuditEvent, AiJob])], controllers: [AuthController, CoreController, AdvancedController], providers: [PrivateStorageService, SchedulerHealthService, { provide: APP_GUARD, useClass: SessionGuard }] }) export class ApiModule {}
