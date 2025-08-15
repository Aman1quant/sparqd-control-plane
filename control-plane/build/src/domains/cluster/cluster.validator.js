"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_validator_1 = require("express-validator");
const clusterValidator = {
    createCluster: [
        (0, express_validator_1.body)('name')
            .notEmpty()
            .withMessage('Cluster name is required')
            .isString()
            .withMessage('Cluster name must be a string')
            .trim()
            .isLength({ min: 4, max: 255 })
            .withMessage('Cluster name must be between 4 and 255 characters'),
        (0, express_validator_1.body)('description')
            .optional()
            .isString()
            .withMessage('Description must be a string')
            .trim()
            .isLength({ max: 1000 })
            .withMessage('Description must not exceed 1000 characters'),
        (0, express_validator_1.body)('clusterTshirtSizeUid').isUUID().withMessage('Must be UUID of clusterTshirtSize'),
        (0, express_validator_1.body)('serviceSelections').isArray({ min: 1 }),
        (0, express_validator_1.body)('serviceSelections.*.serviceUid').isString().notEmpty(),
        (0, express_validator_1.body)('serviceSelections.*.serviceVersionUid').isString().notEmpty(),
    ],
    updateCluster: [
        (0, express_validator_1.param)('uid').isUUID().withMessage('Valid cluster UID is required'),
        (0, express_validator_1.body)('name')
            .optional()
            .isString()
            .withMessage('Cluster name must be a string')
            .trim()
            .isLength({ min: 1, max: 255 })
            .withMessage('Cluster name must be between 4 and 255 characters'),
        (0, express_validator_1.body)('description')
            .optional()
            .isString()
            .withMessage('Description must be a string')
            .trim()
            .isLength({ max: 1000 })
            .withMessage('Description must not exceed 1000 characters'),
        (0, express_validator_1.body)('tshirtSize').optional().isString().withMessage('T-shirt size must be a string'),
        (0, express_validator_1.body)('status').optional().isString().withMessage('Status must be a string').isIn(Object.values(client_1.ClusterStatus)).withMessage('Invalid cluster status'),
        (0, express_validator_1.body)('statusReason')
            .optional()
            .isString()
            .withMessage('Status reason must be a string')
            .trim()
            .isLength({ max: 500 })
            .withMessage('Status reason must not exceed 500 characters'),
        (0, express_validator_1.body)('metadata').optional().isObject().withMessage('Metadata must be a valid JSON object'),
    ],
    getClusterDetail: [(0, express_validator_1.param)('uid').isUUID().withMessage('Valid cluster UID is required')],
    deleteCluster: [(0, express_validator_1.param)('uid').isUUID().withMessage('Valid cluster UID is required')],
    listClusters: [
        (0, express_validator_1.query)('name').optional().isString().withMessage('Name must be a string if provided').trim(),
        (0, express_validator_1.query)('description').optional().isString().withMessage('Description must be a string if provided').trim(),
        (0, express_validator_1.query)('status')
            .optional()
            .isString()
            .withMessage('Status must be a string if provided')
            .isIn(Object.values(client_1.ClusterStatus))
            .withMessage('Invalid cluster status'),
        (0, express_validator_1.query)('tshirtSize').optional().isString().withMessage('T-shirt size must be a string if provided'),
        (0, express_validator_1.query)('createdById').optional().isNumeric().withMessage('Created by ID must be a number if provided'),
        (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer').toInt(),
        (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100').toInt(),
    ],
    updateClusterStatus: [
        (0, express_validator_1.param)('uid').isUUID().withMessage('Valid cluster UID is required'),
        (0, express_validator_1.body)('status').optional().isString().withMessage('Status must be a string').isIn(Object.values(client_1.ClusterStatus)).withMessage('Invalid cluster status'),
        (0, express_validator_1.body)('statusReason')
            .optional()
            .isString()
            .withMessage('Status reason must be a string')
            .trim()
            .isLength({ max: 500 })
            .withMessage('Status reason must not exceed 500 characters'),
    ],
    getClustersByCreator: [(0, express_validator_1.param)('createdById').isNumeric().withMessage('Valid creator ID is required')],
};
exports.default = clusterValidator;
