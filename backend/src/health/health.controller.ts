import { Controller, Get, ServiceUnavailableException } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../common/decorators/public.decorator.js";
import { PrismaService } from "../database/prisma.service.js";

@ApiTags("system")
@Public()
@Controller()
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}
  @Get("health") health() {
    return { status: "ok", timestamp: new Date().toISOString() };
  }
  @Get("ready") async ready() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: "ready" };
    } catch {
      throw new ServiceUnavailableException("Database is unavailable.");
    }
  }
}
