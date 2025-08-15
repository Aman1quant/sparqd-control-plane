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
const role_service_1 = require("@/domains/permission/role.service");
const role_validator_1 = __importDefault(require("@/domains/permission/role.validator"));
const api_1 = require("@/utils/api");
const result_validator_1 = require("@/validator/result.validator");
const roleRouter = (0, express_1.Router)();
roleRouter.get('/', role_validator_1.default.listRoles, result_validator_1.resultValidator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, page = 1, limit = 10 } = req.query;
        const filters = {
            name: name,
            description: description,
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
        };
        const result = yield (0, role_service_1.listRole)(filters);
        res.status(200).json((0, api_1.createSuccessResponse)(result));
    }
    catch (err) {
        logger_1.default.error(err);
        const errorResponse = (0, api_1.createErrorResponse)(err);
        res.status(errorResponse.statusCode).json(errorResponse);
    }
}));
roleRouter.get('/:uid', role_validator_1.default.getRoleDetail, result_validator_1.resultValidator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { uid } = req.params;
        const role = yield (0, role_service_1.detailRole)(uid);
        if (!role) {
            return res.status(404).json((0, api_1.createErrorResponse)(new Error('Role not found')));
        }
        res.status(200).json((0, api_1.createSuccessResponse)(role));
    }
    catch (err) {
        logger_1.default.error(err);
        const errorResponse = (0, api_1.createErrorResponse)(err);
        res.status(errorResponse.statusCode).json(errorResponse);
    }
}));
roleRouter.post('/', role_validator_1.default.createRole, result_validator_1.resultValidator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description } = req.body;
        const roleData = {
            name,
            description,
        };
        const role = yield (0, role_service_1.createRole)(roleData);
        res.status(201).json((0, api_1.createSuccessResponse)(role));
    }
    catch (err) {
        logger_1.default.error(err);
        const errorResponse = (0, api_1.createErrorResponse)(err);
        res.status(errorResponse.statusCode).json(errorResponse);
    }
}));
roleRouter.put('/:uid', role_validator_1.default.updateRole, result_validator_1.resultValidator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { uid } = req.params;
        const { name, description } = req.body;
        const updateData = Object.assign(Object.assign({}, (name !== undefined && { name })), (description !== undefined && { description }));
        const role = yield (0, role_service_1.editRole)(uid, updateData);
        res.status(200).json((0, api_1.createSuccessResponse)(role));
    }
    catch (err) {
        logger_1.default.error(err);
        const errorResponse = (0, api_1.createErrorResponse)(err);
        res.status(errorResponse.statusCode).json(errorResponse);
    }
}));
roleRouter.delete('/:uid', role_validator_1.default.deleteRole, result_validator_1.resultValidator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { uid } = req.params;
        const role = yield (0, role_service_1.deleteRole)(uid);
        res.status(200).json((0, api_1.createSuccessResponse)(role));
    }
    catch (err) {
        logger_1.default.error(err);
        const errorResponse = (0, api_1.createErrorResponse)(err);
        res.status(errorResponse.statusCode).json(errorResponse);
    }
}));
exports.default = roleRouter;
