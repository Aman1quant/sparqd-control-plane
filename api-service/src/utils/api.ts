import crypto from 'crypto';
import dayjs from 'dayjs';
import { BaseResponse } from '../models/api/base-response';

function generateRequestId(): string {
  return crypto.randomUUID();
}

function generateTraceId(): string {
  return crypto.randomBytes(16).toString('hex');
}

function generateSpanId(): string {
  return crypto.randomBytes(8).toString('hex');
}

function createResponse<T>(code: string, serverTime: Date, message?: string, errors?: string | null, data?: T): BaseResponse<T> {
  const formattedTime = dayjs(serverTime).format('YYYY-MM-DDTHH:mm:ss.SSSSSS');

  return {
    code: code,
    message: message,
    errors: errors || null,
    data: data,
    serverTime: formattedTime,
  };
}

function createErrorResponse<T>(message: string, errors?: string, data?: T): BaseResponse<T> {
  return createResponse('FAIL', new Date(), message, errors, data);
}

function createSuccessResponse<T>(data?: T): BaseResponse<T> {
  return createResponse('SUCCESS', new Date(), 'Success', undefined, data);
}

export { generateRequestId, generateTraceId, generateSpanId, createResponse, createErrorResponse, createSuccessResponse };
