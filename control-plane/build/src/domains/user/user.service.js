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
exports.listUser = listUser;
exports.detailUser = detailUser;
exports.createUser = createUser;
exports.createUserTx = createUserTx;
exports.editUser = editUser;
exports.deleteUser = deleteUser;
exports.getUserByEmail = getUserByEmail;
exports.getUserByKcSub = getUserByKcSub;
exports.getInternalUserByKcSub = getInternalUserByKcSub;
const client_1 = require("@prisma/client");
const api_1 = require("@/utils/api");
const user_select_1 = require("./user.select");
const prisma = new client_1.PrismaClient();
function listUser(_a) {
    return __awaiter(this, arguments, void 0, function* ({ email, fullName, page = 1, limit = 10 }) {
        const whereClause = {};
        if (email) {
            whereClause.email = {
                contains: email,
                mode: 'insensitive',
            };
        }
        if (fullName) {
            whereClause.fullName = {
                contains: fullName,
                mode: 'insensitive',
            };
        }
        const [totalData, users] = yield Promise.all([
            prisma.user.count({ where: whereClause }),
            prisma.user.findMany({
                where: whereClause,
                skip: (0, api_1.offsetPagination)(page, limit),
                take: limit,
                select: user_select_1.baseUserSelect,
                orderBy: {
                    createdAt: 'desc',
                },
            }),
        ]);
        const totalPages = Math.ceil(totalData / limit);
        return {
            data: users,
            pagination: {
                currentPage: page,
                totalPages,
                totalData,
                limit,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        };
    });
}
function detailUser(uid) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield prisma.user.findUnique({
            where: { uid },
            select: user_select_1.baseUserSelect,
        });
        if (!user) {
            throw {
                status: 404,
                message: 'User not found',
            };
        }
        return user;
    });
}
function createUser(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const existingUser = yield prisma.user.findUnique({
            where: { email: data.email },
        });
        if (existingUser) {
            throw {
                status: 409,
                message: 'User with this email already exists',
            };
        }
        const existingKcUser = yield prisma.user.findUnique({
            where: { kcSub: data.kcSub },
        });
        if (existingKcUser) {
            throw {
                status: 409,
                message: 'User with this Keycloak ID already exists',
            };
        }
        const user = yield prisma.user.create({ data });
        if (!user) {
            throw {
                status: 500,
                message: 'Failed to create user',
            };
        }
        return user;
    });
}
function createUserTx(tx, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const existingUser = yield tx.user.findUnique({
            where: { email: data.email },
        });
        if (existingUser) {
            throw {
                status: 409,
                message: 'User with this email already exists',
            };
        }
        const existingKcUser = yield tx.user.findUnique({
            where: { kcSub: data.kcSub },
        });
        if (existingKcUser) {
            throw {
                status: 409,
                message: 'User with this Keycloak ID already exists',
            };
        }
        const user = yield tx.user.create({ data });
        if (!user) {
            throw {
                status: 500,
                message: 'Failed to create user',
            };
        }
        return user;
    });
}
function editUser(uid, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const existingUser = yield prisma.user.findUnique({
            where: { uid },
        });
        if (!existingUser) {
            throw {
                status: 404,
                message: 'User not found',
            };
        }
        if (data.email && data.email !== existingUser.email) {
            const emailExists = yield prisma.user.findUnique({
                where: { email: data.email },
            });
            if (emailExists) {
                throw {
                    status: 409,
                    message: 'User with this email already exists',
                };
            }
        }
        const user = yield prisma.user.update({
            where: { uid },
            data,
            select: user_select_1.baseUserSelect,
        });
        return user;
    });
}
function deleteUser(uid) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield prisma.user.findUnique({
            where: { uid },
        });
        if (!user) {
            throw {
                status: 404,
                message: 'User not found',
            };
        }
        const deletedUser = yield prisma.user.delete({
            where: { uid },
        });
        return deletedUser;
    });
}
function getUserByEmail(email) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield prisma.user.findUnique({
            where: { email },
            select: user_select_1.baseUserSelect,
        });
        return user;
    });
}
function getUserByKcSub(kcSub) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield prisma.user.findUnique({
            where: { kcSub },
            select: user_select_1.userSessionInfoSelect,
        });
        return user;
    });
}
function getInternalUserByKcSub(kcSub) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield prisma.user.findUnique({
            where: { kcSub },
            select: user_select_1.userInternalSessionInfoSelect,
        });
        return user;
    });
}
