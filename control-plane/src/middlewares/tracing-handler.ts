import { Request, Response, NextFunction } from 'express';
import { setRequestContext } from '@helpers/request-context';
import { generateTraceId, generateSpanId } from '@utils/api';
import logger from '@config/logger';

export function tracingMiddleware(req: Request, res: Response, next: NextFunction) {
  const incomingTraceparent = req.header('traceparent');

  let traceId: string;
  let parentSpanId: string;

  if (incomingTraceparent) {
    const parts = incomingTraceparent.split('-');
    if (parts.length === 4) {
      traceId = parts[1];
      parentSpanId = parts[2];
    }
  }

  traceId ||= generateTraceId();
  parentSpanId ||= generateSpanId();
  const spanId = generateSpanId();

  // Attach to logger
  req.log = req.log.child({
    trace_id: traceId,
    span_id: spanId,
    parent_span_id: parentSpanId,
  });

  res.setHeader('traceparent', `00-${traceId}-${spanId}-01`);
  res.setHeader('x-request-id', String(req.id));

  if (logger.isLevelEnabled('trace')) {
    req.log.trace('Inbound Request: %o', req.body);

    const originalSend = res.send;

    // Override res.send
    res.send = function (body) {
      req.log.trace('Outgoing Response: %o', body);
      return originalSend.call(this, body);
    };
  }

  setRequestContext(
    {
      reqLogger: req.log,
      traceContext: {
        trace_id: traceId,
        parent_span_id: parentSpanId,
        span_id: spanId,
      },
    },
    () => next(),
  );
}
