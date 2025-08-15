"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.regionSelect = exports.cloudProviderSelect = void 0;
const client_1 = require("@prisma/client");
exports.cloudProviderSelect = client_1.Prisma.validator()({
    id: false,
    uid: true,
    name: true,
    displayName: true,
});
exports.regionSelect = client_1.Prisma.validator()({
    id: false,
    uid: true,
    name: true,
    displayName: true,
    cloudProvider: {
        select: exports.cloudProviderSelect,
    },
});
