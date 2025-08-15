"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const userValidator = {
    createUser: [
        (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
        (0, express_validator_1.body)('kcSub').notEmpty().withMessage('Keycloak subject ID is required').isString().withMessage('Keycloak subject ID must be a string'),
        (0, express_validator_1.body)('fullName').optional().isString().withMessage('Full name must be a string').trim(),
        (0, express_validator_1.body)('avatarUrl').optional().isURL().withMessage('Avatar URL must be a valid URL'),
    ],
    updateUser: [
        (0, express_validator_1.param)('uid').isUUID().withMessage('Valid user UID is required'),
        (0, express_validator_1.body)('email').optional().isEmail().withMessage('Valid email is required').normalizeEmail(),
        (0, express_validator_1.body)('fullName').optional().isString().withMessage('Full name must be a string').trim(),
        (0, express_validator_1.body)('avatarUrl').optional().isURL().withMessage('Avatar URL must be a valid URL'),
    ],
    getUserDetail: [(0, express_validator_1.param)('uid').isUUID().withMessage('Valid user UID is required')],
    deleteUser: [(0, express_validator_1.param)('uid').isUUID().withMessage('Valid user UID is required')],
    getUserByEmail: [(0, express_validator_1.param)('email').isEmail().withMessage('Valid email is required').normalizeEmail()],
    updateSignupStatus: [(0, express_validator_1.param)('uid').isUUID().withMessage('Valid user UID is required')],
    listUsers: [
        (0, express_validator_1.query)('email').optional().isEmail().withMessage('Email must be valid if provided').normalizeEmail(),
        (0, express_validator_1.query)('fullName').optional().isString().withMessage('Full name must be a string if provided').trim(),
        (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer').toInt(),
        (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100').toInt(),
    ],
};
exports.default = userValidator;
