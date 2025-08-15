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
const user_service_1 = require("@/domains/user/user.service");
const user_validator_1 = __importDefault(require("@/domains/user/user.validator"));
const api_1 = require("@/utils/api");
const result_validator_1 = require("@/validator/result.validator");
const userRouter = (0, express_1.Router)();
// userRouter.get('/', userValidator.listUsers, resultValidator, async (req: Request, res: Response) => {
//   try {
//     const { email, fullName, page = 1, limit = 10 } = req.query;
//     const filters = {
//       email: email as string,
//       fullName: fullName as string,
//       page: parseInt(page as string) || 1,
//       limit: parseInt(limit as string) || 10,
//     };
//     const result = await listUser(filters);
//     res.status(200).json(createSuccessResponse(result));
//   } catch (err: unknown) {
//     logger.error(err);
//     const errorResponse = createErrorResponse(err as Error);
//     res.status(errorResponse.statusCode).json(errorResponse);
//   }
// });
userRouter.get('/:uid', user_validator_1.default.getUserDetail, result_validator_1.resultValidator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { uid } = req.params;
        const user = yield (0, user_service_1.detailUser)(uid);
        res.status(200).json((0, api_1.createSuccessResponse)(user));
    }
    catch (err) {
        logger_1.default.error(err);
        const errorResponse = (0, api_1.createErrorResponse)(err);
        res.status(errorResponse.statusCode).json(errorResponse);
    }
}));
userRouter.put('/:uid', user_validator_1.default.updateUser, result_validator_1.resultValidator, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { uid } = req.params;
        const { email, fullName, avatarUrl } = req.body;
        const updateData = {
            email,
            fullName,
            avatarUrl,
        };
        // Remove undefined values
        Object.keys(updateData).forEach((key) => {
            if (updateData[key] === undefined) {
                delete updateData[key];
            }
        });
        const user = yield (0, user_service_1.editUser)(uid, updateData);
        res.status(200).json((0, api_1.createSuccessResponse)(user));
    }
    catch (err) {
        logger_1.default.error(err);
        const errorResponse = (0, api_1.createErrorResponse)(err);
        res.status(errorResponse.statusCode).json(errorResponse);
    }
}));
// userRouter.delete('/:uid', userValidator.deleteUser, resultValidator, async (req: Request, res: Response) => {
//   try {
//     const { uid } = req.params;
//     const user = await deleteUser(uid);
//     res.status(200).json(createSuccessResponse(user));
//   } catch (err: unknown) {
//     logger.error(err);
//     const errorResponse = createErrorResponse(err as Error);
//     res.status(errorResponse.statusCode).json(errorResponse);
//   }
// });
exports.default = userRouter;
