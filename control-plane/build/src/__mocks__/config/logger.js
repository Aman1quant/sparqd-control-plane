"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockLogger = void 0;
exports.mockReqLogger = mockReqLogger;
exports.mockLogger = {
    __esModule: true,
    default: {
        info: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
        warn: jest.fn(),
        level: 'trace',
        fatal: jest.fn(),
        trace: jest.fn(),
        silent: jest.fn(),
        isLevelEnabled: jest.fn().mockReturnValue(true),
        child: jest.fn().mockReturnValue({
            info: jest.fn(),
            error: jest.fn(),
            debug: jest.fn(),
            warn: jest.fn(),
            level: 'trace',
            fatal: jest.fn(),
            trace: jest.fn(),
            silent: jest.fn(),
            child: jest.fn(),
        }),
    },
};
function mockReqLogger(req, res, next) {
    req.log = exports.mockLogger.default;
    next();
}
