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
const express_1 = require("express");
const logger_1 = __importDefault(require("@/config/logger"));
const ClusterService = __importStar(require("@/domains/cluster/cluster.service"));
const cluster_validator_1 = __importDefault(require("@/domains/cluster/cluster.validator"));
const api_1 = require("@/utils/api");
const result_validator_1 = require("@/validator/result.validator");
const clusterRoute = (0, express_1.Router)();
/******************************************************************************
 * Create a cluster
 *****************************************************************************/
clusterRoute.post('/', cluster_validator_1.default.createCluster, result_validator_1.resultValidator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, clusterTshirtSizeUid, serviceSelections } = req.body;
        const result = yield ClusterService.createCluster({
            name,
            description,
            workspace: req.workspace,
            account: req.account,
            userId: req.user.id,
            clusterTshirtSizeUid,
            serviceSelections,
        });
        // Return the complete result with cluster, config, and automation job
        res.status(201).json((0, api_1.createSuccessResponse)(result));
    }
    catch (err) {
        logger_1.default.error({ err }, 'Create cluster failed');
        const errorResponse = (0, api_1.createErrorResponse)(err);
        res.status(errorResponse.statusCode).json(errorResponse);
    }
}));
/******************************************************************************
 * List all clusters accessible for a user
 *****************************************************************************/
clusterRoute.get('/', cluster_validator_1.default.listClusters, result_validator_1.resultValidator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, status, page = 1, limit = 10 } = req.query;
        const filters = {
            name: name,
            description: description,
            workspaceId: req.workspaceUid,
            status: status,
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
        };
        const result = yield ClusterService.listCluster(filters);
        res.status(200).json((0, api_1.createSuccessResponse)(result));
    }
    catch (err) {
        logger_1.default.error(err);
        const errorResponse = (0, api_1.createErrorResponse)(err);
        res.status(errorResponse.statusCode).json(errorResponse);
    }
}));
/******************************************************************************
 * Update a cluster
 *****************************************************************************/
clusterRoute.put('/:uid', cluster_validator_1.default.updateCluster, result_validator_1.resultValidator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { clusterUid } = req.params;
        const { name, description, status } = req.body;
        const cluster = yield ClusterService.updateCluster(clusterUid, {
            name,
            description,
            status,
        });
        res.status(200).json((0, api_1.createSuccessResponse)(cluster));
    }
    catch (err) {
        logger_1.default.error(err);
        const errorResponse = (0, api_1.createErrorResponse)(err);
        res.status(errorResponse.statusCode).json(errorResponse);
    }
}));
/******************************************************************************
 * Describe a cluster
 *****************************************************************************/
clusterRoute.get('/:uid', cluster_validator_1.default.getClusterDetail, result_validator_1.resultValidator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { uid } = req.params;
        const cluster = yield ClusterService.describeCluster(uid);
        res.status(200).json((0, api_1.createSuccessResponse)(cluster));
    }
    catch (err) {
        logger_1.default.error(err);
        const errorResponse = (0, api_1.createErrorResponse)(err);
        res.status(errorResponse.statusCode).json(errorResponse);
    }
}));
/******************************************************************************
 * Delete a cluster
 *****************************************************************************/
clusterRoute.delete('/:uid', cluster_validator_1.default.deleteCluster, result_validator_1.resultValidator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { uid } = req.params;
        const deletedCluster = yield ClusterService.deleteCluster(uid);
        res.status(200).json((0, api_1.createSuccessResponse)(deletedCluster));
    }
    catch (err) {
        logger_1.default.error(err);
        const errorResponse = (0, api_1.createErrorResponse)(err);
        res.status(errorResponse.statusCode).json(errorResponse);
    }
}));
// Additional route for updating cluster status specifically
clusterRoute.patch('/:uid/status', cluster_validator_1.default.updateClusterStatus, result_validator_1.resultValidator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { uid } = req.params;
        const { status, statusReason } = req.body;
        const clusterData = Object.assign({ status }, (statusReason !== undefined && { statusReason }));
        const cluster = yield ClusterService.updateCluster(uid, clusterData);
        res.status(200).json((0, api_1.createSuccessResponse)(cluster));
    }
    catch (err) {
        logger_1.default.error(err);
        const errorResponse = (0, api_1.createErrorResponse)(err);
        res.status(errorResponse.statusCode).json(errorResponse);
    }
}));
clusterRoute.patch('/:uid/shutdown', cluster_validator_1.default.updateClusterStatus, result_validator_1.resultValidator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { uid } = req.params;
        const { statusReason } = req.body;
        const clusterData = Object.assign({ status: 'STOPPED' }, (statusReason !== undefined && { statusReason }));
        const cluster = yield ClusterService.updateCluster(uid, clusterData);
        res.status(200).json((0, api_1.createSuccessResponse)(cluster));
    }
    catch (err) {
        logger_1.default.error(err);
        const errorResponse = (0, api_1.createErrorResponse)(err);
        res.status(errorResponse.statusCode).json(errorResponse);
    }
}));
exports.default = clusterRoute;
