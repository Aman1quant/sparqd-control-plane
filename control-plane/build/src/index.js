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
const dotenv_1 = __importDefault(require("dotenv"));
const env = dotenv_1.default.config();
const http_1 = __importDefault(require("http"));
const prexit_1 = __importDefault(require("prexit"));
const logger_1 = __importDefault(require("./config/logger"));
console.log(`-------------------------------------------------------------------------------------------
`);
if (env.error) {
    if ('code' in env.error && env.error.code === 'ENOENT') {
        logger_1.default.info('No .env file found, using environment variables from system');
    }
    else {
        logger_1.default.error({ err: env.error }, 'Error loading .env file: %o', env.error);
        throw new Error(`Failed to load environment variables: ${env.error.message}`);
    }
}
else {
    logger_1.default.info('.env file loaded successfully');
}
const config_1 = __importDefault(require("@/config/config"));
const app_1 = __importDefault(require("./app"));
const server = http_1.default.createServer(app_1.default);
server.listen(config_1.default.listenPort, () => {
    logger_1.default.info('HTTP Server listening on port: %s, in %s mode', config_1.default.listenPort, config_1.default.nodeEnv);
});
const welcomeMessage = `


********************************************************************
🛰️   Welcome to SPARQD Control Plane
--------------------------------------------------------------------
📦  Environment   : ${process.env.NODE_ENV || 'development'}
🔧  Log Level     : ${process.env.LOG_LEVEL || 'info'}
🌐  Listening on  : http://localhost:3000
📅  Started at    : ${new Date().toLocaleString()}
********************************************************************
`;
logger_1.default.info(welcomeMessage);
// handle graceful shutdown
(0, prexit_1.default)(() => __awaiter(void 0, void 0, void 0, function* () {
    yield new Promise((r) => server.close(r));
    logger_1.default.info('HTTP Server closed');
    logger_1.default.info('Closing clients.');
}));
