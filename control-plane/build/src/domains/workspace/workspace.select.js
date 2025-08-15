"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detailWorkspaceSelect = void 0;
const client_1 = require("@prisma/client");
const account_select_1 = require("../account/account.select");
const user_select_1 = require("../user/user.select");
exports.detailWorkspaceSelect = client_1.Prisma.validator()({
    id: false,
    uid: true,
    name: true,
    description: true,
    account: {
        select: account_select_1.describeAccountSelect,
    },
    storage: true,
    network: true,
    createdAt: true,
    createdBy: {
        select: user_select_1.baseUserSelect,
    },
    updatedAt: true,
});
