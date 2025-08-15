"use strict";
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
const onboarding_service_1 = require("@/domains/onboarding/onboarding.service");
const user_service_1 = require("@/domains/user/user.service");
const api_1 = require("@/utils/api");
const onboardingRouter = (0, express_1.Router)();
onboardingRouter.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const kcSub = (_a = req.kcUser) === null || _a === void 0 ? void 0 : _a.sub;
        const email = (_b = req.kcUser) === null || _b === void 0 ? void 0 : _b.email;
        const firstName = ((_c = req.kcUser) === null || _c === void 0 ? void 0 : _c.given_name) || '';
        const lastName = ((_d = req.kcUser) === null || _d === void 0 ? void 0 : _d.family_name) || '';
        const fullName = `${firstName} ${lastName}`;
        // Check of user exists in DB
        if (kcSub && email) {
            const user = yield (0, user_service_1.getUserByKcSub)(kcSub);
            if (!user) {
                const result = yield (0, onboarding_service_1.onboardNewUser)({
                    email: email,
                    kcSub: kcSub,
                    fullName: fullName,
                    accountName: 'default',
                });
                return res.status(200).json((0, api_1.createSuccessResponse)(result));
            }
            return res.status(200).json((0, api_1.createSuccessResponse)(user));
        }
        else {
            return res.status(404).json({ error: 'User not found' });
        }
    }
    catch (err) {
        logger_1.default.error({ err }, 'Onboarding failed');
        const errorResponse = (0, api_1.createErrorResponse)(err);
        res.status(errorResponse.statusCode).json(errorResponse);
    }
}));
exports.default = onboardingRouter;
