"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mockedClient = {
    realms: {
        find: jest.fn(),
        create: jest.fn(),
    },
    users: {
        find: jest.fn(),
        create: jest.fn(),
    },
    // add whatever you use
};
const KcAdminClient = jest.fn(() => mockedClient);
exports.default = KcAdminClient;
