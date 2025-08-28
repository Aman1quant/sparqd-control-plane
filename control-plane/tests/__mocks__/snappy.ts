export default {
  compress: jest.fn().mockReturnValue(Buffer.from('compressed')),
  uncompress: jest.fn().mockReturnValue(Buffer.from('uncompressed')),
};
