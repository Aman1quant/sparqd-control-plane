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
Object.defineProperty(exports, "__esModule", { value: true });
exports.listRole = listRole;
exports.detailRole = detailRole;
exports.createRole = createRole;
exports.editRole = editRole;
exports.deleteRole = deleteRole;
exports.getRoleByName = getRoleByName;
exports.assignPermissionsToRole = assignPermissionsToRole;
exports.removePermissionsFromRole = removePermissionsFromRole;
const client_1 = require("@prisma/client");
const api_1 = require("@/utils/api");
const prisma = new client_1.PrismaClient();
function listRole(_a) {
    return __awaiter(this, arguments, void 0, function* ({ name, description, page = 1, limit = 10 }) {
        const whereClause = {};
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
        const [totalData, roles] = yield Promise.all([
            prisma.role.count({ where: whereClause }),
            prisma.role.findMany({
                where: whereClause,
                orderBy: { id: 'desc' },
                skip: (0, api_1.offsetPagination)(page, limit),
                take: limit,
                include: {
                    permissions: {
                        include: {
                            permission: {
                                select: {
                                    uid: true,
                                    action: true,
                                    description: true,
                                },
                            },
                        },
                    },
                    accountMembers: {
                        include: {
                            user: {
                                select: {
                                    uid: true,
                                    email: true,
                                    fullName: true,
                                },
                            },
                            account: {
                                select: {
                                    uid: true,
                                    name: true,
                                },
                            },
                        },
                    },
                    _count: {
                        select: {
                            permissions: true,
                            accountMembers: true,
                            resourcePermissions: true,
                        },
                    },
                },
            }),
        ]);
        const pagination = {
            currentPage: page,
            totalPages: Math.ceil(totalData / limit),
            totalData,
            limit,
            hasNextPage: page < Math.ceil(totalData / limit),
            hasPreviousPage: page > 1,
        };
        return {
            data: roles,
            pagination,
        };
    });
}
function detailRole(uid) {
    return __awaiter(this, void 0, void 0, function* () {
        const role = yield prisma.role.findUnique({
            where: { uid },
            include: {
                permissions: {
                    include: {
                        permission: {
                            select: {
                                uid: true,
                                action: true,
                                description: true,
                            },
                        },
                    },
                },
                accountMembers: {
                    include: {
                        user: {
                            select: {
                                uid: true,
                                email: true,
                                fullName: true,
                                avatarUrl: true,
                            },
                        },
                        account: {
                            select: {
                                uid: true,
                                name: true,
                            },
                        },
                    },
                },
                resourcePermissions: {
                    include: {
                        user: {
                            select: {
                                uid: true,
                                email: true,
                                fullName: true,
                            },
                        },
                        account: {
                            select: {
                                uid: true,
                                name: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        permissions: true,
                        accountMembers: true,
                        resourcePermissions: true,
                    },
                },
            },
        });
        return role;
    });
}
function createRole(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const existingRole = yield prisma.role.findUnique({
            where: { name: data.name },
        });
        if (existingRole) {
            throw {
                status: 409,
                message: 'Role with this name already exists',
            };
        }
        const role = yield prisma.role.create({
            data: {
                name: data.name,
                description: data.description,
            },
            include: {
                permissions: {
                    include: {
                        permission: {
                            select: {
                                uid: true,
                                action: true,
                                description: true,
                            },
                        },
                    },
                },
                accountMembers: {
                    include: {
                        user: {
                            select: {
                                uid: true,
                                email: true,
                                fullName: true,
                            },
                        },
                        account: {
                            select: {
                                uid: true,
                                name: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        permissions: true,
                        accountMembers: true,
                        resourcePermissions: true,
                    },
                },
            },
        });
        return role;
    });
}
function editRole(uid, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const existingRole = yield prisma.role.findUnique({
            where: { uid },
        });
        if (!existingRole) {
            throw {
                status: 404,
                message: 'Role not found',
            };
        }
        if (data.name && data.name !== existingRole.name) {
            const nameConflict = yield prisma.role.findUnique({
                where: { name: data.name },
            });
            if (nameConflict) {
                throw {
                    status: 409,
                    message: 'Role with this name already exists',
                };
            }
        }
        const role = yield prisma.role.update({
            where: { uid },
            data,
            include: {
                permissions: {
                    include: {
                        permission: {
                            select: {
                                uid: true,
                                action: true,
                                description: true,
                            },
                        },
                    },
                },
                accountMembers: {
                    include: {
                        user: {
                            select: {
                                uid: true,
                                email: true,
                                fullName: true,
                            },
                        },
                        account: {
                            select: {
                                uid: true,
                                name: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        permissions: true,
                        accountMembers: true,
                        resourcePermissions: true,
                    },
                },
            },
        });
        return role;
    });
}
function deleteRole(uid) {
    return __awaiter(this, void 0, void 0, function* () {
        const existingRole = yield prisma.role.findUnique({
            where: { uid },
        });
        if (!existingRole) {
            throw {
                status: 404,
                message: 'Role not found',
            };
        }
        const accountMembers = yield prisma.accountMember.findMany({
            where: { roleId: existingRole.id },
        });
        if (accountMembers.length > 0) {
            throw {
                status: 409,
                message: 'Cannot delete role that is assigned to account members',
            };
        }
        const resourcePermissions = yield prisma.resourcePermission.findMany({
            where: { roleId: existingRole.id },
        });
        if (resourcePermissions.length > 0) {
            throw {
                status: 409,
                message: 'Cannot delete role that has resource permissions',
            };
        }
        const role = yield prisma.role.delete({
            where: { uid },
        });
        return role;
    });
}
function getRoleByName(name) {
    return __awaiter(this, void 0, void 0, function* () {
        const role = yield prisma.role.findUnique({
            where: { name },
            include: {
                permissions: {
                    include: {
                        permission: {
                            select: {
                                uid: true,
                                action: true,
                                description: true,
                            },
                        },
                    },
                },
                accountMembers: {
                    include: {
                        user: {
                            select: {
                                uid: true,
                                email: true,
                                fullName: true,
                            },
                        },
                        account: {
                            select: {
                                uid: true,
                                name: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        permissions: true,
                        accountMembers: true,
                        resourcePermissions: true,
                    },
                },
            },
        });
        return role;
    });
}
function assignPermissionsToRole(roleUid, permissionUids) {
    return __awaiter(this, void 0, void 0, function* () {
        const role = yield prisma.role.findUnique({
            where: { uid: roleUid },
        });
        if (!role) {
            throw {
                status: 404,
                message: 'Role not found',
            };
        }
        // Get permission IDs from UIDs
        const permissions = yield prisma.permission.findMany({
            where: {
                uid: {
                    in: permissionUids,
                },
            },
        });
        if (permissions.length !== permissionUids.length) {
            throw {
                status: 404,
                message: 'One or more permissions not found',
            };
        }
        // Create role-permission relationships
        const rolePermissionData = permissions.map((permission) => ({
            roleId: role.id,
            permissionId: permission.id,
        }));
        yield prisma.rolePermission.createMany({
            data: rolePermissionData,
            skipDuplicates: true,
        });
        return detailRole(roleUid);
    });
}
function removePermissionsFromRole(roleUid, permissionUids) {
    return __awaiter(this, void 0, void 0, function* () {
        const role = yield prisma.role.findUnique({
            where: { uid: roleUid },
        });
        if (!role) {
            throw {
                status: 404,
                message: 'Role not found',
            };
        }
        // Get permission IDs from UIDs
        const permissions = yield prisma.permission.findMany({
            where: {
                uid: {
                    in: permissionUids,
                },
            },
        });
        if (permissions.length !== permissionUids.length) {
            throw {
                status: 404,
                message: 'One or more permissions not found',
            };
        }
        // Remove role-permission relationships
        yield prisma.rolePermission.deleteMany({
            where: {
                roleId: role.id,
                permissionId: {
                    in: permissions.map((p) => p.id),
                },
            },
        });
        return detailRole(roleUid);
    });
}
