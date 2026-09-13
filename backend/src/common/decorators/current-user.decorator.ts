import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { Request } from "express";
import type { AuthenticatedUser } from "../types/authenticated-user.js";

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    (
      context.switchToHttp().getRequest<Request>() as Request & {
        user: AuthenticatedUser;
      }
    ).user,
);
