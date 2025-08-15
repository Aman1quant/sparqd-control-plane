"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const roleValidator = {
    createRole: [
        (0, express_validator_1.body)('name').notEmpty().withMessage('Role name is required').isString().withMessage('Role name must be a string').trim(),
        (0, express_validator_1.body)('description').optional().isString().withMessage('Description must be a string').trim(),
    ],
    updateRole: [
        (0, express_validator_1.param)('uid').isUUID().withMessage('Valid role UID is required'),
        (0, express_validator_1.body)('name').optional().isString().withMessage('Role name must be a string').trim(),
        (0, express_validator_1.body)('description').optional().isString().withMessage('Description must be a string').trim(),
    ],
    getRoleDetail: [(0, express_validator_1.param)('uid').isUUID().withMessage('Valid role UID is required')],
    deleteRole: [(0, express_validator_1.param)('uid').isUUID().withMessage('Valid role UID is required')],
    getRoleByName: [(0, express_validator_1.param)('name').notEmpty().withMessage('Role name is required').isString().withMessage('Role name must be a string').trim()],
    assignPermissions: [
        (0, express_validator_1.param)('uid').isUUID().withMessage('Valid role UID is required'),
        (0, express_validator_1.body)('permissionUids').isArray().withMessage('Permission UIDs must be an array'),
        (0, express_validator_1.body)('permissionUids.*').isUUID().withMessage('Each permission UID must be a valid UUID'),
    ],
    removePermissions: [
        (0, express_validator_1.param)('uid').isUUID().withMessage('Valid role UID is required'),
        (0, express_validator_1.body)('permissionUids').isArray().withMessage('Permission UIDs must be an array'),
        (0, express_validator_1.body)('permissionUids.*').isUUID().withMessage('Each permission UID must be a valid UUID'),
    ],
    listRoles: [
        (0, express_validator_1.query)('name').optional().isString().withMessage('Name must be a string if provided').trim(),
        (0, express_validator_1.query)('description').optional().isString().withMessage('Description must be a string if provided').trim(),
        (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer').toInt(),
        (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100').toInt(),
    ],
};
exports.default = roleValidator;
