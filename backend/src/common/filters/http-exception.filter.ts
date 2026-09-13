import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { randomUUID } from "node:crypto";

@Catch()
export class GlobalExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const request = host.switchToHttp().getRequest<Request>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const body =
      exception instanceof HttpException ? exception.getResponse() : null;
    const message =
      typeof body === "string"
        ? body
        : typeof body === "object" && body && "message" in body
          ? (body as { message: string | string[] }).message
          : "An unexpected error occurred.";
    response.status(status).json({
      statusCode: status,
      code: status === 500 ? "INTERNAL_ERROR" : `HTTP_${status}`,
      message,
      requestId: request.headers["x-request-id"] ?? randomUUID(),
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
