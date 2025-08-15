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
exports.listCloudRegion = listCloudRegion;
const client_1 = require("@prisma/client");
const api_1 = require("@/utils/api");
const region_type_1 = require("./region.type");
const prisma = new client_1.PrismaClient();
function listCloudRegion(_a) {
    return __awaiter(this, arguments, void 0, function* ({ name, page = 1, limit = 10 }) {
        const whereClause = {};
        if (name) {
            whereClause.name = {
                contains: name,
                mode: 'insensitive',
            };
        }
        const [totalData, regions] = yield Promise.all([
            prisma.region.count({ where: whereClause }),
            prisma.region.findMany({
                where: whereClause,
                // orderBy: { createdAt: 'desc' },
                skip: (0, api_1.offsetPagination)(page, limit),
                take: limit,
                select: region_type_1.detailRegionSelect,
            }),
        ]);
        const totalPages = Math.ceil(totalData / limit);
        return {
            data: regions,
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
