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
exports.getCurrentSessionContext = getCurrentSessionContext;
const client_1 = require("@prisma/client");
const logger_1 = __importDefault(require("@/config/logger"));
const prisma = new client_1.PrismaClient();
function getCurrentSessionContext(data) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!data.activeAccountUid) {
            logger_1.default.debug('activeAccountUid not available');
            throw {
                status: 401,
                message: 'Unauthorized',
            };
        }
        const activeAccount = yield prisma.account.findUnique({
            where: { uid: data.activeAccountUid },
            select: {
                uid: true,
                name: true,
            },
        });
        const activeWorkspace = yield prisma.workspace.findUnique({
            where: { uid: data.activeWorkspaceUid },
            select: {
                uid: true,
                name: true,
            },
        });
        return {
            user: data.user,
            activeAccount,
            activeWorkspace,
            // roles: [],
            // permissions: [],
        };
    });
}
