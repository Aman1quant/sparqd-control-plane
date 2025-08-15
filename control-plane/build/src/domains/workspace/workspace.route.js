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
const workspace_service_1 = require("@/domains/workspace/workspace.service");
const workspace_validator_1 = __importDefault(require("@/domains/workspace/workspace.validator"));
const api_1 = require("@/utils/api");
const result_validator_1 = require("@/validator/result.validator");
const workspaceRoute = (0, express_1.Router)();
/******************************************************************************
 * Get all workspaces
 * Always filtered by userId
 *****************************************************************************/
workspaceRoute.get('/', workspace_validator_1.default.listWorkspaces, result_validator_1.resultValidator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, page = 1, limit = 10 } = req.query;
        const result = yield (0, workspace_service_1.listWorkspace)({
            userId: req.user.id,
            name: name,
            description: description,
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
        });
        res.status(200).json((0, api_1.createSuccessResponse)(result));
    }
    catch (err) {
        logger_1.default.error(err);
        const errorResponse = (0, api_1.createErrorResponse)(err);
        res.status(errorResponse.statusCode).json(errorResponse);
    }
}));
/******************************************************************************
 * Create a workspace
 *****************************************************************************/
workspaceRoute.post('/', workspace_validator_1.default.createWorkspace, result_validator_1.resultValidator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, metadata } = req.body;
        if (!req.user.accountMembers || req.user.accountMembers.length === 0) {
            return res.status(400).json({
                error: 'User must belong to at least one account to create workspace',
            });
        }
        const workspace = yield (0, workspace_service_1.createWorkspace)({
            account: req.account.id,
            name,
            description,
            metadata,
            storage: {}, // TODO: get storage from request body and validate
            network: {}, // TODO: get network from request body and validate
            createdBy: { connect: { id: req.user.id } },
        });
        res.status(201).json((0, api_1.createSuccessResponse)(workspace));
    }
    catch (err) {
        logger_1.default.error(err);
        const errorResponse = (0, api_1.createErrorResponse)(err);
        res.status(errorResponse.statusCode).json(errorResponse);
    }
}));
/******************************************************************************
 * TODO: Update a workspace
 *****************************************************************************/
workspaceRoute.put('/:uid', workspace_validator_1.default.updateWorkspace, result_validator_1.resultValidator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { uid } = req.params;
        const { name, description, metadata } = req.body;
        const workspaceData = Object.assign(Object.assign(Object.assign({}, (name !== undefined && { name })), (description !== undefined && { description })), (metadata !== undefined && { metadata }));
        const workspace = yield (0, workspace_service_1.updateWorkspace)(uid, workspaceData);
        res.status(200).json((0, api_1.createSuccessResponse)(workspace));
    }
    catch (err) {
        logger_1.default.error(err);
        const errorResponse = (0, api_1.createErrorResponse)(err);
        res.status(errorResponse.statusCode).json(errorResponse);
    }
}));
/******************************************************************************
 * Describe a workspace
 *****************************************************************************/
workspaceRoute.get('/:uid', workspace_validator_1.default.getWorkspaceDetail, result_validator_1.resultValidator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { uid } = req.params;
        const workspace = yield (0, workspace_service_1.detailWorkspace)(uid);
        res.status(200).json((0, api_1.createSuccessResponse)(workspace));
    }
    catch (err) {
        logger_1.default.error(err);
        const errorResponse = (0, api_1.createErrorResponse)(err);
        res.status(errorResponse.statusCode).json(errorResponse);
    }
}));
/******************************************************************************
 * Delete a workspace
 *****************************************************************************/
workspaceRoute.delete('/:uid', workspace_validator_1.default.deleteWorkspace, result_validator_1.resultValidator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { uid } = req.params;
        const deletedWorkspace = yield (0, workspace_service_1.deleteWorkspace)(uid);
        res.status(200).json((0, api_1.createSuccessResponse)(deletedWorkspace));
    }
    catch (err) {
        logger_1.default.error(err);
        const errorResponse = (0, api_1.createErrorResponse)(err);
        res.status(errorResponse.statusCode).json(errorResponse);
    }
}));
exports.default = workspaceRoute;
