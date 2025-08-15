"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detailRegionSelect = void 0;
const client_1 = require("@prisma/client");
exports.detailRegionSelect = client_1.Prisma.validator()({
    id: false,
    uid: true,
    name: true,
    displayName: true,
    cloudProvider: {
        select: {
            uid: true,
            name: true,
            displayName: true,
        },
    },
});
