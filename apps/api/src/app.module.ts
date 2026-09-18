import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { ScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule } from "@nestjs/typeorm";
import { validateEnvironment } from "./config";
import { entities } from "./infrastructure/database/entities";
import { ApiModule } from "./modules/api.module";
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnvironment }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET ?? "development-only-secret",
      signOptions: { expiresIn: "7d" },
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: "postgres",
      url:
        process.env.DATABASE_URL ??
        "postgresql://internhub:internhub@localhost:5432/internhub",
      entities,
      synchronize: false,
    }),
    ApiModule,
  ],
})
export class AppModule {}
