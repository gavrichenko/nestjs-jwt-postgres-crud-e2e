import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): any {
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

    response.status(404).json(errorResponse);
  }
}
