"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.availableServicesSelect = void 0;
const client_1 = require("@prisma/client");
exports.availableServicesSelect = client_1.Prisma.validator()({
    id: false,
    uid: true,
    name: true,
    displayName: true,
    description: true,
    isActive: true,
    isFreeTier: true,
    createdAt: true,
    updatedAt: true,
    serviceVersions: {
        select: {
            id: false,
            uid: true,
            version: true,
            appVersion: true,
            releaseDate: true,
            isActive: true,
            isDefault: true,
            changelog: true,
            createdAt: true,
        },
    },
});
