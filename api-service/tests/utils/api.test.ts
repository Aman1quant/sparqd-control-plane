jest.unmock('@/utils/api'); // ignore global mock in jest.setup.ts

import { generateRequestId, generateSpanId, generateTraceId, createResponse, createSuccessResponse, createErrorResponse } from '@/utils/api';

describe('api utils', () => {
  describe('generateRequestId', () => {
    it('should generate a valid UUID v4', () => {
      const id = generateRequestId();
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
      );
    });
  });

  describe('generateTraceId', () => {
    it('should generate a 32-character hex string', () => {
      const id = generateTraceId();
      expect(id).toMatch(/^[a-f0-9]{32}$/);
      expect(id.length).toBe(32);
    });
  });

  describe('generateSpanId', () => {
    it('should generate a 16-character hex string', () => {
      const id = generateSpanId();
      expect(id).toMatch(/^[a-f0-9]{16}$/);
      expect(id.length).toBe(16);
    });
  });

  describe('createResponse', () => {
    it('should create a response with all fields', () => {
      const date = new Date('2024-01-01T12:34:56.789Z');
      const result = createResponse('CODE', date, 'msg', 'err', { foo: 'bar' });

      expect(result.code).toBe('CODE');
      expect(result.message).toBe('msg');
      expect(result.errors).toBe('err');
      expect(result.data).toEqual({ foo: 'bar' });
      expect(result.serverTime).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}$/);
    });
  });

  describe('createSuccessResponse', () => {
    it('should create a success response with data', () => {
      const data = { foo: 'bar' };
      const result = createSuccessResponse(data);

      expect(result.code).toBe('SUCCESS');
      expect(result.message).toBe('Success');
      expect(result.errors).toBeNull();
      expect(result.data).toEqual(data);
      expect(result.serverTime).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}$/);
    });

    it('should create a success response without data', () => {
      const result = createSuccessResponse();

      expect(result.code).toBe('SUCCESS');
      expect(result.message).toBe('Success');
      expect(result.errors).toBeNull();
      expect(result.data).toBeUndefined();
      expect(result.serverTime).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}$/);
    });
  });

  describe('createErrorResponse', () => {
    it('should create an error response with message and errors', () => {
      const result = createErrorResponse('fail msg', 'err details', { foo: 'bar' });

      expect(result.code).toBe('FAIL');
      expect(result.message).toBe('fail msg');
      expect(result.errors).toBe('err details');
      expect(result.data).toEqual({ foo: 'bar' });
      expect(result.serverTime).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}$/);
    });

    it('should create an error response with only a message', () => {
      const result = createErrorResponse('fail msg');

      expect(result.code).toBe('FAIL');
      expect(result.message).toBe('fail msg');
      expect(result.errors).toBeNull();
      expect(result.data).toBeUndefined();
      expect(result.serverTime).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}$/);
    });
  });
});
