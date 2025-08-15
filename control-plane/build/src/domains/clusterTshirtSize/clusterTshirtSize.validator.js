"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_validator_1 = require("express-validator");
const clusterTshirtSizeValidator = {
    listclusterTshirtSizes: [
        (0, express_validator_1.query)('name').optional().isString().withMessage('Name must be a string'),
        (0, express_validator_1.query)('provider').optional().isString().withMessage('Provider must be a string').isIn(Object.values(client_1.Provider)).withMessage('Invalid cluster status'),
        (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer').toInt(),
        (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100').toInt(),
    ],
};
exports.default = clusterTshirtSizeValidator;
