import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application, ApplicationHistory, AuthSession, Company, Notification, Placement, Posting, SavedPosting, StudentProfile, Task, User } from '../infrastructure/database/entities';
import { SessionGuard } from './auth';
import { AuthController, CoreController } from './controllers';
@Module({ imports: [TypeOrmModule.forFeature([User, AuthSession, StudentProfile, Company, Posting, SavedPosting, Application, ApplicationHistory, Placement, Task, Notification])], controllers: [AuthController, CoreController], providers: [{ provide: APP_GUARD, useClass: SessionGuard }] }) export class ApiModule {}
