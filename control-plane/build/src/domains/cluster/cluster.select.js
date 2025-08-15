"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletedClusterSelect = exports.detailClusterSelect = exports.createClusterResultSelect = void 0;
const client_1 = require("@prisma/client");
exports.createClusterResultSelect = client_1.Prisma.validator()({
    uid: true,
    name: true,
    description: true,
    status: true,
    statusReason: true,
    latestEvent: true,
    services: {
        select: {
            version: {
                select: {
                    version: true,
                },
            },
            service: {
                select: {
                    uid: true,
                    name: true,
                    displayName: true,
                },
            },
        },
    },
    currentConfig: {
        select: {
            uid: true,
            version: true,
            clusterTshirtSize: {
                select: {
                    uid: true,
                    name: true,
                    isFreeTier: true,
                    nodeInstanceTypes: true,
                },
            },
        },
    },
    createdAt: true,
    createdBy: {
        select: {
            uid: true,
            email: true,
            fullName: true,
            avatarUrl: true,
        },
    },
});
exports.detailClusterSelect = client_1.Prisma.validator()({
    id: false,
    uid: true,
    name: true,
    status: true,
    statusReason: true,
    currentConfig: {
        select: {
            uid: true,
            version: true,
            clusterTshirtSize: {
                select: {
                    name: true,
                },
            },
        },
    },
    configs: {
        select: {
            uid: true,
            version: true,
            clusterTshirtSize: {
                select: {
                    name: true,
                },
            },
        },
    },
    services: {
        include: {
            service: true,
        },
    },
    workspace: {
        select: {
            uid: true,
            name: true,
        },
    },
    createdAt: true,
    updatedAt: true,
});
exports.deletedClusterSelect = client_1.Prisma.validator()({
    uid: true,
    name: true,
    status: true,
    statusReason: true,
    currentConfigId: true,
    createdAt: true,
    updatedAt: true,
});
