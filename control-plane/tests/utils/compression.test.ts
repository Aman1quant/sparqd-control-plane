import { compress, decompress } from '../../src/utils/compression';
import snappy from 'snappy';

describe('compression utils', () => {
  describe('compress', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('returns empty string when input is empty', async () => {
      const result = await compress('');
      expect(result).toBe('');
      expect(snappy.compress).not.toHaveBeenCalled();
    });

    it('compresses data successfully', async () => {
      const mockCompressedBuffer = Buffer.from('compressedData');
      jest.spyOn(snappy, 'compress').mockResolvedValueOnce(mockCompressedBuffer);

      const result = await compress('testData');

      expect(snappy.compress).toHaveBeenCalledWith('testData');
      expect(result).toBe(mockCompressedBuffer.toString('base64'));
    });

    it('returns original data when compression fails', async () => {
      jest.spyOn(snappy, 'compress').mockRejectedValueOnce(new Error('Compression failed'));

      const result = await compress('testData');

      expect(snappy.compress).toHaveBeenCalledWith('testData');
      expect(result).toBe('testData');
    });
  });

  describe('decompress', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('returns null when input is null', async () => {
      const result = await decompress(null);
      expect(result).toBeNull();
      expect(snappy.uncompress).not.toHaveBeenCalled();
    });

    it('returns empty string when input is empty', async () => {
      const result = await decompress('');
      expect(result).toBe('');
      expect(snappy.uncompress).not.toHaveBeenCalled();
    });

    it('decompresses data successfully', async () => {
      const mockDecompressedBuffer = Buffer.from('decompressedData');
      jest.spyOn(snappy, 'uncompress').mockResolvedValueOnce(mockDecompressedBuffer);

      const result = await decompress('base64EncodedData');

      expect(snappy.uncompress).toHaveBeenCalledWith(expect.any(Buffer));
      expect(result).toBe('decompressedData');
    });

    it('returns original data when decompression fails', async () => {
      jest.spyOn(snappy, 'uncompress').mockRejectedValueOnce(new Error('Decompression failed'));

      const result = await decompress('base64EncodedData');

      expect(snappy.uncompress).toHaveBeenCalledWith(expect.any(Buffer));
      expect(result).toBe('base64EncodedData');
    });
  });
});
