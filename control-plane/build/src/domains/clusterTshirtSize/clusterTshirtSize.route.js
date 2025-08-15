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
const clusterTshirtSize_service_1 = require("@domains/clusterTshirtSize/clusterTshirtSize.service");
const express_1 = require("express");
const logger_1 = __importDefault(require("@/config/logger"));
const clusterTshirtSize_validator_1 = __importDefault(require("@/domains/clusterTshirtSize/clusterTshirtSize.validator"));
const api_1 = require("@/utils/api");
const result_validator_1 = require("@/validator/result.validator");
const clusterTshirtSizeRoute = (0, express_1.Router)();
clusterTshirtSizeRoute.get('/', clusterTshirtSize_validator_1.default.listclusterTshirtSizes, result_validator_1.resultValidator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, page = 1, limit = 10 } = req.query;
        const filters = {
            name: name,
            description: description,
            plan: req.account.plan,
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
        };
        const result = yield (0, clusterTshirtSize_service_1.listClusterTshirtSize)(filters);
        res.status(200).json((0, api_1.createSuccessResponse)(result));
    }
    catch (err) {
        logger_1.default.error(err);
        const errorResponse = (0, api_1.createErrorResponse)(err);
        res.status(errorResponse.statusCode).json(errorResponse);
    }
}));
exports.default = clusterTshirtSizeRoute;
