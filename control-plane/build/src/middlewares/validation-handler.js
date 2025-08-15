"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("@utils/api");
const express_validator_1 = require("express-validator");
const validator = express_validator_1.validationResult.withDefaults({
    formatter: (error) => error.msg,
});
function _handleValidation(req, res, next, apiFn) {
    const validation = validator(req);
    if (!validation.isEmpty()) {
        const errors = validation.array().join(';');
        return res.status(400).json((0, api_1.createErrorResponse)('Request Validation Error', errors));
    }
    const result = apiFn(req, res, next);
    if (result && typeof result.catch === 'function') {
        result.catch(next);
    }
}
function validateRequest(fn) {
    return (req, res, next) => {
        _handleValidation(req, res, next, fn);
    };
}
exports.default = validateRequest;
