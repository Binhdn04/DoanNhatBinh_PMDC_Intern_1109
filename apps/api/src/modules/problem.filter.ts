import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { Request, Response } from 'express';

/** Single wire error shape for domain, authorization and class-validator failures. */
@Catch()
export class ProblemFilter implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp(); const res = ctx.getResponse<Response>(); const req = ctx.getRequest<Request>();
    const exception = error instanceof HttpException ? error : new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    const status = exception.getStatus(); const body = exception.getResponse(); const detail = typeof body === 'string' ? body : (body as any).message;
    const messages = Array.isArray(detail) ? detail : undefined;
    res.status(status).type('application/problem+json').send({ type: `https://internhub.local/problems/${status}`, title: HttpStatus[status] ?? 'Error', status, detail: Array.isArray(detail) ? 'Request validation failed' : detail, instance: req.originalUrl, ...(messages ? { errors: messages.map(message => ({ field: 'body', message: String(message) })) } : {}) });
  }
}
