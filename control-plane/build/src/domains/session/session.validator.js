"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const sessionValidator = {
    switchSession: [(0, express_validator_1.body)('accountUid').isUUID(), (0, express_validator_1.body)('workspaceUid').isUUID()],
};
exports.default = sessionValidator;
