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
const express_1 = require("express");
const logger_1 = __importDefault(require("@/config/logger"));
const session_service_1 = require("@/domains/session/session.service");
const session_validator_1 = __importDefault(require("@/domains/session/session.validator"));
const api_1 = require("@/utils/api");
const result_validator_1 = require("@/validator/result.validator");
const sessionRoute = (0, express_1.Router)();
/******************************************************************************
 * Switch current session context (Account/Workspace switcher)
 *****************************************************************************/
sessionRoute.post('/switch', session_validator_1.default.switchSession, result_validator_1.resultValidator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { accountUid, workspaceUid } = req.body;
        // const user = req.user;
        // TODO: check permission
        res.cookie('active_account', accountUid, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
        });
        res.cookie('active_workspace', workspaceUid, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
        });
        res.status(200).json((0, api_1.createSuccessResponse)({}));
    }
    catch (err) {
        logger_1.default.error(err);
        const errorResponse = (0, api_1.createErrorResponse)(err);
        res.status(errorResponse.statusCode).json(errorResponse);
    }
}));
/******************************************************************************
 * Get current session context
 *****************************************************************************/
sessionRoute.get('/context', result_validator_1.resultValidator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const accountUid = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.active_account;
        const workspaceUid = (_b = req.cookies) === null || _b === void 0 ? void 0 : _b.active_workspace;
        logger_1.default.debug({ accountUid, workspaceUid });
        const result = yield (0, session_service_1.getCurrentSessionContext)({
            user: req.user,
            activeAccountUid: accountUid,
            activeWorkspaceUid: workspaceUid,
        });
        res.status(200).json((0, api_1.createSuccessResponse)(result));
    }
    catch (err) {
        logger_1.default.error(err);
        const errorResponse = (0, api_1.createErrorResponse)(err);
        res.status(errorResponse.statusCode).json(errorResponse);
    }
}));
exports.default = sessionRoute;
