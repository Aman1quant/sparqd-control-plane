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
exports.resolveTenantContextOptional = resolveTenantContextOptional;
exports.resolveTenantContextRequired = resolveTenantContextRequired;
const logger_1 = __importDefault(require("@/config/logger"));
const account_service_1 = require("@/domains/account/account.service");
const workspace_service_1 = require("@/domains/workspace/workspace.service");
// Common logic
function extractTenantContext(req) {
    var _a, _b;
    const accountUid = req.headers['x-account-uid'] || ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.active_account);
    const workspaceUid = req.headers['x-workspace-uid'] || ((_b = req.cookies) === null || _b === void 0 ? void 0 : _b.active_workspace);
    return { accountUid, workspaceUid };
}
// Optional context (can be undefined)
function resolveTenantContextOptional(req, res, next) {
    const { accountUid, workspaceUid } = extractTenantContext(req);
    logger_1.default.debug({ originalUrl: req.originalUrl, accountUid, workspaceUid }, 'Optional context');
    req.accountUid = accountUid;
    req.workspaceUid = workspaceUid;
    next();
}
// Required context (throws if missing)
function resolveTenantContextRequired(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { accountUid, workspaceUid } = extractTenantContext(req);
        logger_1.default.debug({ originalUrl: req.originalUrl, accountUid, workspaceUid }, 'Required context');
        if (!accountUid || !workspaceUid) {
            return res.status(400).json({
                statusCode: 400,
                error: 'Missing active account/workspace context',
            });
        }
        req.accountUid = accountUid;
        req.workspaceUid = workspaceUid;
        req.account = yield (0, account_service_1.describeAccount)(accountUid);
        req.workspace = yield (0, workspace_service_1.detailWorkspace)(workspaceUid);
        next();
    });
}
