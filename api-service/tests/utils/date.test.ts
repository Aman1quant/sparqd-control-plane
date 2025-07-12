import { formatDateWithTimezone } from '@/utils/date';

describe('Date Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('formatDateWithTimezone', () => {
    it('should format date with default timezone', () => {
      const result = formatDateWithTimezone('2023-01-15T12:00:00Z');
      expect(result).toBe('2023-01-15T19:00:00+07:00');
    });

    it('should use current date when no date is provided', () => {
      // This test is not deterministic, so just check the format
      const result = formatDateWithTimezone();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+07:00$/);
    });

    it('should use provided timezone', () => {
      const result = formatDateWithTimezone('2023-01-15T12:00:00Z', 'Europe/Paris');
      expect(result).toBe('2023-01-15T13:00:00+01:00');
    });
  });

});
