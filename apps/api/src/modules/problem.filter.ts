import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { EntityNotFoundError, QueryFailedError } from "typeorm";

/** Single wire error shape for domain, authorization and class-validator failures. */
@Catch()
export class ProblemFilter implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    if (error instanceof EntityNotFoundError)
      error = new HttpException("Record not found", 404);
    if (error instanceof QueryFailedError) {
      const code = (error.driverError as { code?: string }).code;
      if (code === "23505")
        error = new HttpException("Record already exists", 409);
      else if (["23503", "23514", "22P02"].includes(code ?? ""))
        error = new HttpException("Invalid record data", 400);
    }
    if (!(error instanceof HttpException))
      new Logger("RequestError").error({
        event: "request_failed",
        method: req.method,
        path: req.path,
        error: error instanceof Error ? error.name : "UnknownError",
      });
    const exception =
      error instanceof HttpException
        ? error
        : new HttpException(
            "Internal Server Error",
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
    const status = exception.getStatus();
    const body = exception.getResponse();
    const detail = typeof body === "string" ? body : (body as any).message;
    const messages = Array.isArray(detail) ? detail : undefined;
    res
      .status(status)
      .type("application/problem+json")
      .send({
        type: `https://internhub.local/problems/${status}`,
        title: HttpStatus[status] ?? "Error",
        status,
        detail: Array.isArray(detail) ? "Request validation failed" : detail,
        instance: req.path ?? req.originalUrl.split("?")[0],
        ...(messages
          ? {
              errors: messages.map((message) => ({
                field: "body",
                message: String(message),
              })),
            }
          : {}),
      });
  }
}
