"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resultValidator = resultValidator;
const express_validator_1 = require("express-validator");
const api_1 = require("@/utils/api");
function resultValidator(req, res, next) {
    const validated = (0, express_validator_1.validationResult)(req);
    if (!validated.isEmpty())
        return next(res.status(422).json((0, api_1.createErrorResponse)('Validation failed', validated.array())));
    return next();
}
