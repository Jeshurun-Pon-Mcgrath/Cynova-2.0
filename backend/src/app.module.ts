import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { LoggerModule } from "nestjs-pino";
import { AuthModule } from "./auth/auth.module.js";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard.js";
import { environmentSchema } from "./config/environment.js";
import { DatabaseModule } from "./database/database.module.js";
import { GameModule } from "./game/game.module.js";
import { HealthModule } from "./health/health.module.js";
import { ProfilesModule } from "./profiles/profiles.module.js";
import { QuestsModule } from "./quests/quests.module.js";
import { RewardsModule } from "./rewards/rewards.module.js";
import { SkillsModule } from "./skills/skills.module.js";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: environmentSchema,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? "info",
        redact: [
          "req.headers.authorization",
          "req.headers.cookie",
          "res.headers.set-cookie",
          "password",
          "passwordHash",
          "refreshToken",
          "DATABASE_URL",
          "DIRECT_URL",
        ],
      },
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    DatabaseModule,
    AuthModule,
    GameModule,
    ProfilesModule,
    QuestsModule,
    RewardsModule,
    SkillsModule,
    HealthModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
