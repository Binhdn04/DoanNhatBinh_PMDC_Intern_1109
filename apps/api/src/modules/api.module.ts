import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiJob, Application, ApplicationDocument, ApplicationHistory, AuditEvent, AuthSession, Company, Document, Notification, PerformanceEvaluation, Placement, Posting, ReportDraftDocument, ReportReview, ReportVersion, ReportVersionDocument, ReportingPeriod, SavedPosting, SelfAssessment, StudentDocument, StudentProfile, SupervisorAssignment, SupervisorProfile, Task, User, WeeklyReport } from '../infrastructure/database/entities';
import { SessionGuard } from './auth';
import { AuthController, CoreController } from './controllers';
import { AdvancedController } from './advanced.controller';
import { PrivateStorageService } from './private-storage.service';
import { SchedulerHealthService } from './scheduler-health.service';
@Module({ imports: [TypeOrmModule.forFeature([User, AuthSession, StudentProfile, Company, Posting, SavedPosting, Application, ApplicationDocument, ApplicationHistory, Placement, Task, Notification, Document, StudentDocument, SupervisorProfile, SupervisorAssignment, ReportingPeriod, WeeklyReport, ReportVersion, ReportReview, ReportDraftDocument, ReportVersionDocument, SelfAssessment, PerformanceEvaluation, AuditEvent, AiJob])], controllers: [AuthController, CoreController, AdvancedController], providers: [PrivateStorageService, SchedulerHealthService, { provide: APP_GUARD, useClass: SessionGuard }] }) export class ApiModule {}
