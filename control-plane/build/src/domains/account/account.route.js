"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.accountRouter = void 0;
const AccountService = __importStar(require("@domains/account/account.service"));
const client_1 = require("@prisma/client");
const express_1 = require("express");
const logger_1 = __importDefault(require("@/config/logger"));
const api_1 = require("@/utils/api");
exports.accountRouter = (0, express_1.Router)();
/******************************************************************************
 * Get all accounts
 * Always filtered by userId
 *****************************************************************************/
exports.accountRouter.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name = '', page = 1, limit = 10 } = req.query;
        const accounts = yield AccountService.listAccount({
            userId: req.user.id,
            name: String(name),
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
        });
        res.status(200).json((0, api_1.createSuccessResponse)(accounts));
    }
    catch (err) {
        logger_1.default.error(err);
        const errorResponse = (0, api_1.createErrorResponse)(err);
        res.status(errorResponse.statusCode).json(errorResponse);
    }
}));
/******************************************************************************
 * Get an account
 *****************************************************************************/
exports.accountRouter.get('/:uid', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid } = req.params;
    try {
        const account = yield AccountService.describeAccount(uid);
        res.status(200).json((0, api_1.createSuccessResponse)(account));
    }
    catch (err) {
        logger_1.default.error(err);
        const errorResponse = (0, api_1.createErrorResponse)(err);
        res.status(errorResponse.statusCode).json(errorResponse);
    }
}));
/******************************************************************************
 * Create an account
 *****************************************************************************/
exports.accountRouter.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, region, plan, networkConfig, storageConfig } = req.body;
    try {
        const prisma = new client_1.PrismaClient();
        const account = yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            return yield AccountService.createAccountTx(tx, {
                name,
                region,
                user: req.user,
                plan,
                networkConfig,
                storageConfig,
                isDefault: false,
            });
        }));
        res.status(201).json((0, api_1.createSuccessResponse)(account));
    }
    catch (err) {
        logger_1.default.error(err);
        const errorResponse = (0, api_1.createErrorResponse)(err);
        res.status(errorResponse.statusCode).json(errorResponse);
    }
}));
/******************************************************************************
 * Modify an account
 *****************************************************************************/
exports.accountRouter.put('/:uid', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid } = req.params;
    const { name } = req.body;
    try {
        const account = yield AccountService.editAccount(uid, { name });
        res.status(200).json((0, api_1.createSuccessResponse)(account));
    }
    catch (err) {
        logger_1.default.error(err);
        const errorResponse = (0, api_1.createErrorResponse)(err);
        res.status(errorResponse.statusCode).json(errorResponse);
    }
}));
/******************************************************************************
 * Delete an account
 *****************************************************************************/
exports.accountRouter.delete('/:uid', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid } = req.params;
    try {
        const account = yield AccountService.deleteAccount(uid);
        res.status(200).json((0, api_1.createSuccessResponse)(account));
    }
    catch (err) {
        logger_1.default.error(err);
        const errorResponse = (0, api_1.createErrorResponse)(err);
        res.status(errorResponse.statusCode).json(errorResponse);
    }
}));
exports.default = exports.accountRouter;
