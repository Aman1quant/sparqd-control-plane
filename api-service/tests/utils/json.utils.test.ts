import { safeJsonParse } from '../../src/utils/json.utils';

describe('safeJsonParse', () => {
  it('should return fallback when input is null', () => {
    const fallback = { default: 'value' };
    const result = safeJsonParse(null, fallback);
    expect(result).toEqual(fallback);
  });

  it('should return fallback when input is empty string', () => {
    const fallback = { default: 'value' };
    const result = safeJsonParse('', fallback);
    expect(result).toEqual(fallback);
  });

  it('should successfully parse valid JSON string', () => {
    const input = '{"name": "test", "value": 123}';
    const fallback = { default: 'value' };
    const expected = { name: 'test', value: 123 };

    const result = safeJsonParse(input, fallback);
    expect(result).toEqual(expected);
  });

  it('should return fallback when JSON is invalid', () => {
    const input = '{"name": "test", "value": 123';
    const fallback = { default: 'value' };

    const result = safeJsonParse(input, fallback);
    expect(result).toEqual(fallback);
  });

  it('should handle different types of fallback values', () => {
    // Test with number fallback
    expect(safeJsonParse('invalid', 42)).toBe(42);

    // Test with string fallback
    expect(safeJsonParse('invalid', 'default')).toBe('default');

    // Test with array fallback
    expect(safeJsonParse('invalid', [1, 2, 3])).toEqual([1, 2, 3]);

    // Test with boolean fallback
    expect(safeJsonParse('invalid', true)).toBe(true);
  });
});
