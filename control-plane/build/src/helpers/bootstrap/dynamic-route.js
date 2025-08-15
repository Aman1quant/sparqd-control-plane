"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const logger_1 = __importDefault(require("../../config/logger"));
const isRouteFile = (file) => /\.route\.(ts|js)$/i.test(file);
const registerRoutes = (router) => {
    const routesDir = path_1.default.join(__dirname, '../../routes');
    const walkDir = (dir) => {
        const entries = fs_1.default.readdirSync(dir, { withFileTypes: true });
        entries.forEach((entry) => {
            const fullPath = path_1.default.join(dir, entry.name);
            if (entry.isDirectory()) {
                walkDir(fullPath); // 🔁 recursion for nested folders like v1/
            }
            else if (entry.isFile() && isRouteFile(entry.name)) {
                logger_1.default.info(`    ${path_1.default.relative(routesDir, fullPath)}`);
                const routeModule = require(fullPath);
                const register = routeModule.default || routeModule;
                if (typeof register === 'function') {
                    register(router); // inject into main router
                }
            }
        });
    };
    walkDir(routesDir);
    // Log registered routes
    const routes = [];
    router.stack.forEach((layer) => {
        var _a, _b;
        if (((_a = layer.route) === null || _a === void 0 ? void 0 : _a.path) && ((_b = layer.route) === null || _b === void 0 ? void 0 : _b.methods)) {
            const methods = Object.keys(layer.route.methods)
                .filter((m) => layer.route.methods[m])
                .map((m) => m.toUpperCase());
            methods.forEach((method) => {
                routes.push(`${method} ${layer.route.path}`);
            });
        }
    });
    if (routes.length > 0) {
        logger_1.default.info('Registered API routes:');
        routes.forEach((route) => logger_1.default.info(`  → ${route}`));
    }
    else {
        logger_1.default.warn('No API routes registered.');
    }
};
exports.default = registerRoutes;
