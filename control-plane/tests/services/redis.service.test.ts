import redisClient from '@config/clients/redis.client';
import { compress, decompress } from '@utils/compression';
import { REDIS_KEY_PREFIXES, buildRedisKey, checkExists, getKey, setKey } from '@services/redis.service';

jest.mock('@utils/compression', () => ({
  compress: jest.fn(),
  decompress: jest.fn(),
}));

describe('RedisService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (compress as jest.Mock).mockImplementation(async (data: string) => `compressed_${data}`);
    (decompress as jest.Mock).mockImplementation(async (data: string | null) => (data ? data.replace('compressed_', '') : null));
  });

  describe('buildRedisKey', () => {
    it('should build a Redis key with the given prefix and identifier', () => {
      const key = buildRedisKey('OFFER', '123');
      expect(key).toBe(`${REDIS_KEY_PREFIXES.OFFER}123`);
    });

    it('should work for all defined prefixes', () => {
      const identifier = 'test-id';
      Object.keys(REDIS_KEY_PREFIXES).forEach((prefixKey) => {
        const key = buildRedisKey(prefixKey as keyof typeof REDIS_KEY_PREFIXES, identifier);
        expect(key).toBe(`${REDIS_KEY_PREFIXES[prefixKey as keyof typeof REDIS_KEY_PREFIXES]}${identifier}`);
      });
    });
  });

  describe('checkExists', () => {
    it('should return true if key exists', async () => {
      (redisClient.exists as jest.Mock).mockResolvedValue(1);
      const result = await checkExists('some:key');
      expect(redisClient.exists).toHaveBeenCalledWith('some:key');
      expect(result).toBe(true);
    });

    it('should return false if key does not exist', async () => {
      (redisClient.exists as jest.Mock).mockResolvedValue(0);
      const result = await checkExists('some:key');
      expect(redisClient.exists).toHaveBeenCalledWith('some:key');
      expect(result).toBe(false);
    });

    it('should throw an error if redisClient.exists fails', async () => {
      const error = new Error('Redis error');
      (redisClient.exists as jest.Mock).mockRejectedValue(error);
      await expect(checkExists('some:key')).rejects.toThrow('Failed to check existence of key some:key: Redis error');
    });
  });

  describe('setKey', () => {
    const key = 'test:key';
    const value = 'testValue';

    it('should set key without TTL and without compression', async () => {
      const nonCompressedKey = `${REDIS_KEY_PREFIXES.SYNONYM}123`; // SYNONYM is not in COMPRESSED_PREFIXES
      await setKey(nonCompressedKey, value);
      expect(redisClient.set).toHaveBeenCalledWith(nonCompressedKey, value, undefined);
      expect(compress).not.toHaveBeenCalled();
    });

    it('should set key with TTL and without compression', async () => {
      const nonCompressedKey = `${REDIS_KEY_PREFIXES.INTENT}abc`; // INTENT is not in COMPRESSED_PREFIXES
      const ttl = 3600;
      await setKey(nonCompressedKey, value, ttl);
      expect(redisClient.set).toHaveBeenCalledWith(nonCompressedKey, value, { EX: ttl });
      expect(compress).not.toHaveBeenCalled();
    });

    it('should set key without TTL and with compression for OFFER prefix', async () => {
      const offerKey = `${REDIS_KEY_PREFIXES.OFFER}offer1`;
      await setKey(offerKey, value);
      expect(compress).toHaveBeenCalledWith(value);
      expect(redisClient.set).toHaveBeenCalledWith(offerKey, `compressed_${value}`, undefined);
    });

    it('should set key with TTL and with compression for COMPLETE prefix', async () => {
      const completeKey = `${REDIS_KEY_PREFIXES.COMPLETE}comp1`;
      const ttl = 1800;
      await setKey(completeKey, value, ttl);
      expect(compress).toHaveBeenCalledWith(value);
      expect(redisClient.set).toHaveBeenCalledWith(completeKey, `compressed_${value}`, { EX: ttl });
    });

    it('should set key with TTL and with compression for RESULT prefix', async () => {
      const resultKey = `${REDIS_KEY_PREFIXES.RESULT}res1`;
      const ttl = 1800;
      await setKey(resultKey, value, ttl);
      expect(compress).toHaveBeenCalledWith(value);
      expect(redisClient.set).toHaveBeenCalledWith(resultKey, `compressed_${value}`, { EX: ttl });
    });

    it('should throw an error if redisClient.set fails', async () => {
      const error = new Error('Redis set error');
      (redisClient.set as jest.Mock).mockRejectedValue(error);
      await expect(setKey(key, value)).rejects.toThrow(`Failed to set key ${key} in Redis: Redis set error`);
    });

    it('should throw an error if compress fails for a compressible key', async () => {
      const offerKey = `${REDIS_KEY_PREFIXES.OFFER}offer-fail`;
      const compressError = new Error('Compression failed');
      (compress as jest.Mock).mockRejectedValue(compressError);
      await expect(setKey(offerKey, value)).rejects.toThrow(`Failed to set key ${offerKey} in Redis: ${compressError.message}`);
    });
  });

  describe('getKey', () => {
    const value = 'testValue';

    it('should get key without decompression', async () => {
      const nonCompressedKey = `${REDIS_KEY_PREFIXES.SPELLING}spell1`; // SPELLING is not in COMPRESSED_PREFIXES
      (redisClient.get as jest.Mock).mockResolvedValue(value);
      const result = await getKey(nonCompressedKey);
      expect(redisClient.get).toHaveBeenCalledWith(nonCompressedKey);
      expect(decompress).not.toHaveBeenCalled();
      expect(result).toBe(value);
    });

    it('should get key with decompression for OFFER prefix', async () => {
      const offerKey = `${REDIS_KEY_PREFIXES.OFFER}offer1`;
      (redisClient.get as jest.Mock).mockResolvedValue(`compressed_${value}`);
      const result = await getKey(offerKey);
      expect(redisClient.get).toHaveBeenCalledWith(offerKey);
      expect(decompress).toHaveBeenCalledWith(`compressed_${value}`);
      expect(result).toBe(value);
    });

    it('should get key with decompression for COMPLETE prefix', async () => {
      const completeKey = `${REDIS_KEY_PREFIXES.COMPLETE}comp1`;
      (redisClient.get as jest.Mock).mockResolvedValue(`compressed_${value}`);
      const result = await getKey(completeKey);
      expect(redisClient.get).toHaveBeenCalledWith(completeKey);
      expect(decompress).toHaveBeenCalledWith(`compressed_${value}`);
      expect(result).toBe(value);
    });

    it('should get key with decompression for RESULT prefix', async () => {
      const resultKey = `${REDIS_KEY_PREFIXES.RESULT}res1`;
      (redisClient.get as jest.Mock).mockResolvedValue(`compressed_${value}`);
      const resultFromService = await getKey(resultKey);
      expect(redisClient.get).toHaveBeenCalledWith(resultKey);
      expect(decompress).toHaveBeenCalledWith(`compressed_${value}`);
      expect(resultFromService).toBe(value);
    });

    it('should return null if key not found', async () => {
      const key = 'nonexistent:key';
      (redisClient.get as jest.Mock).mockResolvedValue(null);
      const result = await getKey(key);
      expect(result).toBeNull();
    });

    it('should throw an error if redisClient.get fails', async () => {
      const key = 'error:key';
      const error = new Error('Redis get error');
      (redisClient.get as jest.Mock).mockRejectedValue(error);
      await expect(getKey(key)).rejects.toThrow(`Failed to get key ${key} from Redis: Redis get error`);
    });

    it('should throw an error if decompress fails for a compressible key', async () => {
      const offerKey = `${REDIS_KEY_PREFIXES.OFFER}offer-fail`;
      const decompressError = new Error('Decompression failed');
      (redisClient.get as jest.Mock).mockResolvedValue('compressed_data_that_will_fail_decompression');
      (decompress as jest.Mock).mockRejectedValue(decompressError);
      await expect(getKey(offerKey)).rejects.toThrow(`Failed to get key ${offerKey} from Redis: ${decompressError.message}`);
    });

    it('should handle null value from redis.get correctly when decompression is expected', async () => {
      const offerKey = `${REDIS_KEY_PREFIXES.OFFER}offer-null`;
      (redisClient.get as jest.Mock).mockResolvedValue(null);
      const result = await getKey(offerKey);
      expect(redisClient.get).toHaveBeenCalledWith(offerKey);
      // decompress will be called with null
      expect(decompress).toHaveBeenCalledWith(null);
      // decompress mock returns null for null input
      expect(result).toBeNull();
    });
  });
});
