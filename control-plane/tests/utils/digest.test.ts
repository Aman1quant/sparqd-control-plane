import { createJsonSha1, createJsonSha1Stable } from '../../src/utils/digest';

describe('createJsonSha1', () => {
  it('generates consistent hash for primitive values', async () => {
    expect(await createJsonSha1('hello')).toBe(await createJsonSha1('hello'));
    expect(await createJsonSha1(123)).toBe(await createJsonSha1(123));
    expect(await createJsonSha1(true)).toBe(await createJsonSha1(true));
    expect(await createJsonSha1(null)).toBe(await createJsonSha1(null));
  });

  it('generates different hashes for objects with different property orders', async () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = { b: 2, a: 1 };
    expect(await createJsonSha1(obj1)).not.toBe(await createJsonSha1(obj2));
  });

  it('generates the same hash for the same array', async () => {
    const arr = [1, 2, 3];
    expect(await createJsonSha1(arr)).toBe(await createJsonSha1([1, 2, 3]));
  });
});

describe('createJsonSha1Stable', () => {
  it('generates same hash for objects with same content but different key order', async () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = { b: 2, a: 1 };
    expect(await createJsonSha1Stable(obj1)).toBe(await createJsonSha1Stable(obj2));
  });

  it('handles nested objects with different key order', async () => {
    const obj1 = { a: { x: 1, y: 2 }, b: 3 };
    const obj2 = { b: 3, a: { y: 2, x: 1 } };
    expect(await createJsonSha1Stable(obj1)).toBe(await createJsonSha1Stable(obj2));
  });

  it('generates consistent hash for arrays and primitives', async () => {
    expect(await createJsonSha1Stable([1, 2, 3])).toBe(await createJsonSha1Stable([1, 2, 3]));
    expect(await createJsonSha1Stable('hello')).toBe(await createJsonSha1Stable('hello'));
    expect(await createJsonSha1Stable(123)).toBe(await createJsonSha1Stable(123));
  });

  it('produces different hashes for different content', async () => {
    expect(await createJsonSha1Stable({ a: 1 })).not.toBe(await createJsonSha1Stable({ a: 2 }));
    expect(await createJsonSha1Stable({ a: 1 })).not.toBe(await createJsonSha1Stable({ b: 1 }));
  });
});
