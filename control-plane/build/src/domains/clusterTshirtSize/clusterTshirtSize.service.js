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
exports.detailClusterTshirtSizeSelect = void 0;
exports.listClusterTshirtSize = listClusterTshirtSize;
exports.checkClusterTshirtSizeExists = checkClusterTshirtSizeExists;
const client_1 = require("@prisma/client");
const logger_1 = __importDefault(require("@/config/logger"));
const api_1 = require("@/utils/api");
const region_select_1 = require("../region/region.select");
const prisma = new client_1.PrismaClient();
exports.detailClusterTshirtSizeSelect = client_1.Prisma.validator()({
    uid: true,
    name: true,
    nodeInstanceTypes: true,
    isActive: true,
    isFreeTier: true,
    region: {
        select: region_select_1.regionSelect,
    },
});
function listClusterTshirtSize(_a) {
    return __awaiter(this, arguments, void 0, function* ({ provider, name, plan, description, createdById, page = 1, limit = 10, }) {
        const whereClause = {};
        logger_1.default.debug({ provider, plan }, 'Provider and plan');
        if (plan === 'FREE') {
            whereClause.isFreeTier = true;
        }
        if (provider) {
            whereClause.provider = provider;
        }
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
        if (createdById) {
            whereClause.createdById = createdById;
        }
        whereClause.isActive = true;
        const [totalData, clusters] = yield Promise.all([
            prisma.clusterTshirtSize.count({ where: whereClause }),
            prisma.clusterTshirtSize.findMany({
                where: whereClause,
                orderBy: { createdAt: 'desc' },
                skip: (0, api_1.offsetPagination)(page, limit),
                take: limit,
                select: exports.detailClusterTshirtSizeSelect,
            }),
        ]);
        const totalPages = Math.ceil(totalData / limit);
        return {
            data: clusters,
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
function checkClusterTshirtSizeExists(uid) {
    return __awaiter(this, void 0, void 0, function* () {
        const clusterTshirtSize = yield prisma.clusterTshirtSize.findUnique({
            where: { uid },
        });
        if (!clusterTshirtSize) {
            throw {
                status: 404,
                message: 'Cluster Tshirt Size does not exist',
            };
        }
        return clusterTshirtSize;
    });
}
