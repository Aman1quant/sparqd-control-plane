"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const workspaceValidator = {
    createWorkspace: [
        (0, express_validator_1.body)('name')
            .notEmpty()
            .withMessage('Workspace name is required')
            .isString()
            .withMessage('Workspace name must be a string')
            .trim()
            .isLength({ min: 1, max: 255 })
            .withMessage('Workspace name must be between 1 and 255 characters'),
        (0, express_validator_1.body)('description')
            .optional()
            .isString()
            .withMessage('Description must be a string')
            .trim()
            .isLength({ max: 1000 })
            .withMessage('Description must not exceed 1000 characters'),
        (0, express_validator_1.body)('metadata').optional().isObject().withMessage('Metadata must be a valid JSON object'),
    ],
    updateWorkspace: [
        (0, express_validator_1.param)('uid').isUUID().withMessage('Valid workspace UID is required'),
        (0, express_validator_1.body)('name')
            .optional()
            .isString()
            .withMessage('Workspace name must be a string')
            .trim()
            .isLength({ min: 1, max: 255 })
            .withMessage('Workspace name must be between 1 and 255 characters'),
        (0, express_validator_1.body)('description')
            .optional()
            .isString()
            .withMessage('Description must be a string')
            .trim()
            .isLength({ max: 1000 })
            .withMessage('Description must not exceed 1000 characters'),
        (0, express_validator_1.body)('metadata').optional().isObject().withMessage('Metadata must be a valid JSON object'),
    ],
    getWorkspaceDetail: [(0, express_validator_1.param)('uid').isUUID().withMessage('Valid workspace UID is required')],
    deleteWorkspace: [(0, express_validator_1.param)('uid').isUUID().withMessage('Valid workspace UID is required')],
    getWorkspacesByAccount: [(0, express_validator_1.param)('accountId').isNumeric().withMessage('Valid account ID is required')],
    getWorkspaceByName: [
        (0, express_validator_1.param)('accountId').isNumeric().withMessage('Valid account ID is required'),
        (0, express_validator_1.param)('name').notEmpty().withMessage('Workspace name is required').isString().withMessage('Workspace name must be a string').trim(),
    ],
    listWorkspaces: [
        (0, express_validator_1.query)('name').optional().isString().withMessage('Name must be a string if provided').trim(),
        (0, express_validator_1.query)('description').optional().isString().withMessage('Description must be a string if provided').trim(),
        (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer').toInt(),
        (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100').toInt(),
    ],
    updateWorkspaceMetadata: [
        (0, express_validator_1.param)('uid').isUUID().withMessage('Valid workspace UID is required'),
        (0, express_validator_1.body)('metadata').notEmpty().withMessage('Metadata is required').isObject().withMessage('Metadata must be a valid JSON object'),
    ],
    getWorkspacesByCreator: [(0, express_validator_1.param)('createdByUid').isNumeric().withMessage('Valid creator ID is required')],
};
exports.default = workspaceValidator;
