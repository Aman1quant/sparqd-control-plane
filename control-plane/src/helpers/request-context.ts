import logger from '@config/logger';
import { AsyncLocalStorage } from 'async_hooks';
import type { Logger } from 'pino';

interface RequestContext {
  reqLogger: Logger | Logger<'metric', boolean>;
  traceContext: {
    trace_id: string;
    parent_span_id: string;
    span_id: string;
  };
}

const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

export function setRequestContext(context: RequestContext, func: () => void): void {
  asyncLocalStorage.run(context, func);
}

export function getRequestLogger(): Logger | Logger<'metric', boolean> {
  const store = asyncLocalStorage.getStore();
  return store?.reqLogger ?? logger;
}

export function getTraceId(): string {
  const store = asyncLocalStorage.getStore();
  return store?.traceContext?.trace_id ?? crypto.randomUUID();
}

export function getSpanId(): string {
  const store = asyncLocalStorage.getStore();
  return store?.traceContext?.span_id ?? crypto.randomUUID();
}
