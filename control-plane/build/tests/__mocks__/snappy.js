"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    compress: jest.fn().mockReturnValue(Buffer.from('compressed')),
    uncompress: jest.fn().mockReturnValue(Buffer.from('uncompressed')),
};
