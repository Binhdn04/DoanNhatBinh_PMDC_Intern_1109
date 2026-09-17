import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ProblemFilter } from './modules/problem.filter';
export async function bootstrap() { const app = await NestFactory.create(AppModule); app.setGlobalPrefix('api/v1'); app.enableCors(); app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true })); app.useGlobalFilters(new ProblemFilter()); await app.listen(Number(process.env.PORT ?? 3000)); }

if (require.main === module) void bootstrap();
