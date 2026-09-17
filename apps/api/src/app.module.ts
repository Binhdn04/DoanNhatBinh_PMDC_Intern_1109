import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { entities } from './infrastructure/database/entities';
import { ApiModule } from './modules/api.module';
@Module({ imports: [ConfigModule.forRoot({ isGlobal: true }), JwtModule.register({ global: true, secret: process.env.JWT_SECRET ?? 'development-only-secret' }), ScheduleModule.forRoot(), TypeOrmModule.forRoot({ type: 'postgres', url: process.env.DATABASE_URL ?? 'postgresql://internhub:internhub@localhost:5432/internhub', entities, synchronize: false }), ApiModule] }) export class AppModule {}
