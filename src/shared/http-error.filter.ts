import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { isInstance } from 'class-validator';

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): any {
    if (!isInstance(exception, HttpException)) {
      const errorResponse = {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        timestamp: new Date().toLocaleString(),
        message: 'Internal error',
      };
      Logger.error(
        `Internal error: ${exception}`,
        JSON.stringify(errorResponse),
        'ExceptionFilter',
      );
      return host
        .switchToHttp()
        .getResponse()
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(errorResponse);
    }
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    const getErrorMsg = (): string | undefined =>
      typeof exception.getResponse() === 'object'
        ? (exception.getResponse() as Record<string, any>).error
        : undefined;

    const errorResponse = {
      code: exception.getStatus(),
      timestamp: new Date().toLocaleString(),
      path: request.url,
      method: request.method,
      message: exception.message,
      error: getErrorMsg(),
    };

    Logger.error(
      `${request.method} ${request.url}`,
      JSON.stringify(errorResponse),
      'ExceptionFilter',
    );

    response.status(errorResponse.code).json(errorResponse);
  }
}
