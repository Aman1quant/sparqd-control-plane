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
exports.createEphemeralDir = createEphemeralDir;
exports.deleteEphemeralDir = deleteEphemeralDir;
exports.copyTemplateToDir = copyTemplateToDir;
const crypto_1 = require("crypto");
const fs = __importStar(require("fs"));
const promises_1 = require("fs/promises");
const os_1 = require("os");
const path_1 = require("path");
const logger_1 = __importDefault(require("./logger"));
function createEphemeralDir() {
    return __awaiter(this, arguments, void 0, function* (prefix = 'ephemeral-') {
        const randomId = (0, crypto_1.randomBytes)(6).toString('hex');
        const dir = yield (0, promises_1.mkdtemp)((0, path_1.join)((0, os_1.tmpdir)(), `${prefix}${randomId}-`));
        logger_1.default.info(`[createEphemeralDir] Created: ${dir}`);
        return dir;
    });
}
function deleteEphemeralDir(dir) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, promises_1.rm)(dir, { recursive: true, force: true });
            logger_1.default.info(`[deleteEphemeralDir] Deleted: ${dir}`);
        }
        catch (err) {
            logger_1.default.warn(`[deleteEphemeralDir] Failed to delete ${dir}:`, err);
            throw err; // Optional: rethrow if you want to fail the activity
        }
    });
}
function copyTemplateToDir(srcDir, destDir) {
    return __awaiter(this, void 0, void 0, function* () {
        yield fs.promises.cp(srcDir, destDir, { recursive: true });
        return destDir;
    });
}
