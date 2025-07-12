export const mockErrorResponseFn = (message: string, errors?: string, data?: any) => ({
  code: 'FAIL',
  message,
  errors,
  data,
  serverTime: '2025-01-01T00:00:00.00',
});

export const createSuccessResponse = jest.fn().mockImplementation((data) => ({
  code: 'SUCCESS',
  message: 'Success',
  errors: null,
  data,
  serverTime: '2025-01-01T00:00:00.00',
}));

export const createErrorResponse = jest.fn().mockImplementation(mockErrorResponseFn);
