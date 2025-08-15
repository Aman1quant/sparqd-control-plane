"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const email = (0, express_validator_1.body)('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail().trim();
const forgotPassword = [email];
const authValidator = {
    forgotPassword,
};
exports.default = authValidator;
