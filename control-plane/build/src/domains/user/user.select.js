"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userInternalSessionInfoSelect = exports.userSessionInfoSelect = exports.baseUserSelect = exports.internalUserSelect = void 0;
const client_1 = require("@prisma/client");
exports.internalUserSelect = {
    id: true,
    uid: true,
    kcSub: false,
    email: true,
    fullName: true,
    avatarUrl: true,
    createdAt: true,
};
// Base interface for user selection
exports.baseUserSelect = client_1.Prisma.validator()({
    uid: true,
    email: true,
    fullName: true,
    avatarUrl: true,
});
/**
 * Base session info select (id excluded)
 */
exports.userSessionInfoSelect = client_1.Prisma.validator()({
    id: false,
    uid: true,
    email: true,
    fullName: true,
    avatarUrl: true,
    createdAt: true,
    accountMembers: {
        select: {
            account: {
                select: {
                    uid: true,
                    name: true,
                    plan: true,
                    createdAt: true,
                    workspaces: {
                        select: {
                            uid: true,
                            name: true,
                            createdAt: true,
                            members: {
                                select: {
                                    role: {
                                        select: {
                                            uid: true,
                                            name: true,
                                            description: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            role: {
                select: {
                    uid: true,
                    name: true,
                    description: true,
                },
            },
        },
    },
});
/**
 * Variant that overrides the top-level `id` to be included.
 */
exports.userInternalSessionInfoSelect = client_1.Prisma.validator()(Object.assign(Object.assign({}, exports.userSessionInfoSelect), { id: true }));
