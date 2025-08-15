"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.describeAccountSelect = void 0;
const client_1 = require("@prisma/client");
exports.describeAccountSelect = client_1.Prisma.validator()({
    uid: true,
    name: true,
    region: {
        include: {
            cloudProvider: true,
        },
    },
    plan: true,
    metadata: true,
    createdAt: true,
    updatedAt: true,
    storage: {
        select: {
            uid: true,
            storageName: true,
        },
    },
    network: {
        select: {
            uid: true,
            networkName: true,
        },
    },
});
