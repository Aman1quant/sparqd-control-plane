"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listWorkspace = listWorkspace;
exports.detailWorkspace = detailWorkspace;
exports.createWorkspace = createWorkspace;
exports.createWorkspaceTx = createWorkspaceTx;
exports.updateWorkspace = updateWorkspace;
exports.deleteWorkspace = deleteWorkspace;
exports.checkWorkspaceExists = checkWorkspaceExists;
const client_1 = require("@prisma/client");
const logger_1 = __importDefault(require("@/config/logger"));
const api_1 = require("@/utils/api");
const workspace_select_1 = require("./workspace.select");
const prisma = new client_1.PrismaClient();
/******************************************************************************
 * List available workspaces
 *****************************************************************************/
function listWorkspace(_a) {
    return __awaiter(this, arguments, void 0, function* ({ userId, name, description, page = 1, limit = 10 }) {
        const whereClause = {};
        // IMPORTANT: Mandatory filter by userId
        whereClause.members = {
            some: {
                userId,
            },
        };
        // OPTIONALS
        if (name) {
            whereClause.name = {
                contains: name,
                mode: 'insensitive',
            };
        }
        if (description) {
            whereClause.description = {
                contains: description,
                mode: 'insensitive',
            };
        }
        logger_1.default.debug({ userId }, 'Listing workspaces for a user');
        const [totalData, workspaces] = yield Promise.all([
            prisma.workspace.count({ where: whereClause }),
            prisma.workspace.findMany({
                where: whereClause,
                orderBy: { createdAt: 'desc' },
                skip: (0, api_1.offsetPagination)(page, limit),
                take: limit,
                select: workspace_select_1.detailWorkspaceSelect,
            }),
        ]);
        const totalPages = Math.ceil(totalData / limit);
        return {
            data: workspaces,
            pagination: {
                totalData,
                totalPages,
                currentPage: page,
                limit,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        };
    });
}
/******************************************************************************
 * Describe a workspace
 *****************************************************************************/
function detailWorkspace(uid) {
    return __awaiter(this, void 0, void 0, function* () {
        const workspace = yield prisma.workspace.findUnique({
            where: { uid },
            select: workspace_select_1.detailWorkspaceSelect,
        });
        if (!workspace) {
            throw {
                status: 404,
                message: 'Workspace not found',
            };
        }
        return workspace;
    });
}
function createWorkspace(data) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const accountExists = yield prisma.account.findUnique({
            where: { id: (_a = data.account.connect) === null || _a === void 0 ? void 0 : _a.id },
        });
        if (!accountExists) {
            throw {
                status: 404,
                message: 'Account not found',
            };
        }
        const workspace = yield prisma.workspace.create({
            data,
        });
        if (!workspace) {
            throw {
                status: 500,
                message: 'Failed to create workspace',
            };
        }
        return workspace;
    });
}
function createWorkspaceTx(tx, data) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const accountExists = yield tx.account.findUnique({
            where: { id: (_a = data.account.connect) === null || _a === void 0 ? void 0 : _a.id },
        });
        if (!accountExists) {
            throw {
                status: 404,
                message: 'Account not found',
            };
        }
        const workspace = yield tx.workspace.create({
            data,
        });
        if (!workspace) {
            throw {
                status: 500,
                message: 'Failed to create workspace',
            };
        }
        return workspace;
    });
}
function updateWorkspace(uid, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const existingWorkspace = yield prisma.workspace.findUnique({
            where: { uid },
        });
        if (!existingWorkspace) {
            throw {
                status: 404,
                message: 'Workspace not found',
            };
        }
        const updatedWorkspace = yield prisma.workspace.update({
            where: { uid },
            data,
        });
        return updatedWorkspace;
    });
}
function deleteWorkspace(uid) {
    return __awaiter(this, void 0, void 0, function* () {
        const existingWorkspace = yield prisma.workspace.findUnique({
            where: { uid },
        });
        if (!existingWorkspace) {
            throw {
                status: 404,
                message: 'Workspace not found',
            };
        }
        const deletedWorkspace = yield prisma.workspace.delete({
            where: { uid },
        });
        return deletedWorkspace;
    });
}
function checkWorkspaceExists(uid) {
    return __awaiter(this, void 0, void 0, function* () {
        const workspace = yield prisma.workspace.findUnique({
            where: { uid },
        });
        if (!workspace) {
            throw {
                status: 404,
                message: 'Workspace not found',
            };
        }
        return workspace;
    });
}
