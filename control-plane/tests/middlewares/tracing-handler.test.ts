import { tracingMiddleware } from '@middlewares/tracing-handler';
import { setRequestContext } from '@helpers/request-context';
import { mockLogger } from 'tests/__mocks__/config/logger';
import { generateTraceId, generateSpanId } from '@utils/api';

jest.mock('@helpers/request-context', () => ({
  setRequestContext: jest.fn(),
}));

jest.mock('@utils/api', () => ({
  generateTraceId: jest.fn(),
  generateSpanId: jest.fn(),
}));

describe('tracingMiddleware', () => {
  let req: any;
  let res: any;
  let next: jest.Mock;

  let childFn = jest.fn().mockReturnValue('child-logger');

  beforeEach(() => {
    req = {
      header: jest.fn(),
      log: {
        child: childFn,
      },
    };
    res = {
      setHeader: jest.fn(),
    };
    next = jest.fn();

    (childFn as jest.Mock).mockReturnValue('child-logger');
    (generateSpanId as jest.Mock).mockReturnValue('generated-span-id');
    (generateTraceId as jest.Mock).mockReturnValue('generated-trace-id');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should use traceparent header if present and correctly formatted', () => {
    req.header.mockReturnValue('00-abc123traceid-def456spanid-01');

    tracingMiddleware(req, res, next);

    expect(childFn).toHaveBeenCalledWith({
      trace_id: 'abc123traceid',
      span_id: 'generated-span-id',
      parent_span_id: 'def456spanid',
    });

    expect(setRequestContext).toHaveBeenCalledWith({
      reqLogger: 'child-logger',
      traceContext: {
        trace_id: 'abc123traceid',
        parent_span_id: 'def456spanid',
        span_id: 'generated-span-id',
      },
    }, expect.any(Function));

    expect(res.setHeader).toHaveBeenCalledWith('traceparent', '00-abc123traceid-generated-span-id-01');
    // expect(next).toHaveBeenCalled();
  });

  it('should generate traceId and parentSpanId if traceparent is missing', () => {
    req.header.mockReturnValue(undefined);

    tracingMiddleware(req, res, next);

    expect(generateTraceId).toHaveBeenCalled();
    expect(generateSpanId).toHaveBeenCalledTimes(2); // parent + new span

    expect(childFn).toHaveBeenCalledWith({
      trace_id: 'generated-trace-id',
      span_id: 'generated-span-id',
      parent_span_id: 'generated-span-id',
    });

    expect(res.setHeader).toHaveBeenCalledWith('traceparent', '00-generated-trace-id-generated-span-id-01');
    // expect(next).toHaveBeenCalled();
  });

  it('should generate IDs if traceparent is malformed', () => {
    req.header.mockReturnValue('invalid-header');

    tracingMiddleware(req, res, next);

    expect(generateTraceId).toHaveBeenCalled();
    expect(generateSpanId).toHaveBeenCalledTimes(2);

    expect(childFn).toHaveBeenCalledWith({
      trace_id: 'generated-trace-id',
      span_id: 'generated-span-id',
      parent_span_id: 'generated-span-id',
    });

    expect(res.setHeader).toHaveBeenCalledWith('traceparent', '00-generated-trace-id-generated-span-id-01');
    // expect(next).toHaveBeenCalled();
  });
});
