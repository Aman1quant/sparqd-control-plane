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
// import redisClient from '@config/clients/redis.client';
const healthRouter = (0, express_1.Router)();
healthRouter.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.debug('Healthy');
    const response = {
        status: 'ok',
        uptime: process.uptime(),
        timestamp: Date.now(),
        services: {
            keycloak: 'unknown',
            redis: 'unknown',
        },
    };
    // try {
    //   // Check Redis
    //   await redisClient.ping();
    //   response.services.redis = 'ok';
    // } catch (error) {
    //   req.log.error(error, 'Redis health check failed');
    //   response.services.redis = 'error';
    //   response.status = 'error';
    // }
    res.status(response.status === 'ok' ? 200 : 503).json(response);
}));
exports.default = healthRouter;
