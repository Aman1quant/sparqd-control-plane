"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("@config/config"));
const routes_1 = require("../dist/routes");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swaggerDocument = __importStar(require("../dist/swagger.json"));
const cors_1 = __importDefault(require("@helpers/bootstrap/cors"));
const exception_handler_1 = __importDefault(require("@middlewares/exception-handler"));
// import healthRouter from '@routes/health-check';
// import { tracingMiddleware } from '@middlewares/tracing-handler';
// import { generateRequestId } from '@utils/api';
// import v1Router from '@routes/v1';
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const helmet_1 = __importDefault(require("helmet"));
const httpLogger_1 = __importDefault(require("@/config/httpLogger"));
const app = (0, express_1.default)();
app.use((0, compression_1.default)());
app.use(express_1.default.json({ limit: config_1.default.jsonLimit }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, helmet_1.default)());
app.use((0, cookie_parser_1.default)());
// Configure session
const memoryStore = new express_session_1.default.MemoryStore();
app.use((0, express_session_1.default)({
    secret: 'mySecret',
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
    },
}));
// HTTP Logger
app.use(httpLogger_1.default);
// Middlewares
// const logHttpTraffic = config.logLevel === 'debug';
// app.use(
//   pinoHttp({
//     logger,
//     genReqId: generateRequestId,
//     // quietReqLogger: !logHttpTraffic,
//     // quietResLogger: !logHttpTraffic,
//     // serializers: {
//     //   req: (req) => ({
//     //     method: req.method,
//     //     url: req.url,
//     //     headers: {
//     //       ...req.headers,
//     //       authorization: undefined,
//     //       cookie: undefined,
//     //     },
//     //     remoteAddress: req.socket?.remoteAddress,
//     //     remotePort: req.socket?.remotePort,
//     //   }),
//     //   res: (res) => ({
//     //     statusCode: res.statusCode,
//     //     headers: res.getHeaders?.() || res._headers || {},
//     //   }),
//     // },
//     // autoLogging: {
//     //   ignore: (req) => {
//     //     // Ignore health check that are not logged
//     //     return req.url.startsWith('/__health__') || req.url.startsWith('/health');
//     //   },
//     // },
//     customLogLevel: (_req, res, _err) => {
//       if (res.statusCode >= 500) {
//         return 'error';
//       }
//       if (res.statusCode >= 400) {
//         return 'warn';
//       }
//       return 'info';
//     },
//   }),
// );
// app.use((req, res, next) => {
//   const start = Date.now();
//   res.on('finish', () => {
//     const responseTime = Date.now() - start;
//     logger.info({
//       method: req.method,
//       url: req.originalUrl,
//       statusCode: res.statusCode,
//       responseTime,
//     }, 'HTTP request');
//   });
//   next();
// });
// app.use(tracingMiddleware);
// Test
// app.use((req, res, next) => {
//   res.on('finish', () => {
//     console.log(`DEBUG: ${req.method} ${req.url} => ${res.statusCode}`);
//   });
//   next();
// });
// app.use('/health', healthRouter);
// CORS
(0, cors_1.default)(app);
// V1 routes
// app.use('/api/v1', v1Router);
const tsoaApiV1Router = express_1.default.Router();
(0, routes_1.RegisterRoutes)(tsoaApiV1Router);
app.use("/api/v1", tsoaApiV1Router);
// Swagger docs for V1
app.use("/api/v1/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument));
// General Exception handler
app.use(exception_handler_1.default);
exports.default = app;
