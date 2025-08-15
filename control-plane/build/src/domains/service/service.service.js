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
exports.getAvailableServices = getAvailableServices;
const client_1 = require("@prisma/client");
const api_1 = require("@/utils/api");
const service_select_1 = require("./service.select");
const prisma = new client_1.PrismaClient();
/******************************************************************************
 * Get Available Services
 *****************************************************************************/
function getAvailableServices(_a) {
    return __awaiter(this, arguments, void 0, function* ({ page = 1, limit = 10, plan }) {
        const whereClause = {};
        if (plan === 'FREE') {
            whereClause.isFreeTier = true;
        }
        const [totalData, availableServices] = yield Promise.all([
            prisma.service.count({ where: whereClause }),
            prisma.service.findMany({
                where: whereClause,
                orderBy: { createdAt: 'desc' },
                skip: (0, api_1.offsetPagination)(page, limit),
                take: limit,
                select: service_select_1.availableServicesSelect,
            }),
        ]);
        const totalPages = Math.ceil(totalData / limit);
        return {
            data: availableServices,
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
