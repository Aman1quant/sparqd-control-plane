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
exports.runTofu = runTofu;
exports.writeTfVarsJsonFile = writeTfVarsJsonFile;
const activity_1 = require("@temporalio/activity");
const child_process_1 = require("child_process");
const fs = __importStar(require("fs"));
const logger_1 = __importDefault(require("./logger"));
/**
 * Executes an OpenTofu CLI command using child_process.spawn,
 * with real-time logging and Temporal heartbeat support.
 *
 * Streams stdout and stderr to the logger, and returns the combined stdout
 * on success. Rejects with detailed error on failure.
 *
 * @param {string} command - The full tofu CLI command to run (e.g. "tofu plan -var-file=...").
 * @param {string} workingDir - The directory in which to run the command.
 * @returns {Promise<string>} - Resolves with stdout output if the command succeeds.
 * @throws {Error} - Throws with stderr or exit code if the command fails.
 */
function runTofu(command, workingDir) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.default.info({ command, cwd: workingDir }, 'Running OpenTofu command');
        const ctx = activity_1.Context.current();
        // Periodic Temporal heartbeat to indicate the worker is still alive
        const heartbeatInterval = setInterval(() => {
            ctx.heartbeat(`Running ${command}`);
        }, 10000); // heartbeat every 10 seconds
        return new Promise((resolve, reject) => {
            // Split the command into binary and arguments for spawn
            const [cmd, ...args] = command.split(' ');
            const child = (0, child_process_1.spawn)(cmd, args, {
                cwd: workingDir,
                env: process.env,
                shell: true, // Allow shell features like quotes and pipes
                stdio: ['inherit', 'pipe', 'pipe'], // Inherit stdin; pipe stdout and stderr
            });
            let stdout = '';
            let stderr = '';
            // Capture and log stdout in real-time
            child.stdout.on('data', (data) => {
                const text = data.toString();
                stdout += text;
                logger_1.default.info({ command }, `stdout: ${text.trim()}`);
            });
            // Capture and log stderr in real-time
            child.stderr.on('data', (data) => {
                const text = data.toString();
                stderr += text;
                logger_1.default.warn({ command }, `stderr: ${text.trim()}`);
            });
            // Handle errors that prevent the process from starting
            child.on('error', (err) => {
                clearInterval(heartbeatInterval);
                logger_1.default.error({ err, command }, 'OpenTofu spawn error');
                reject(err);
            });
            // Handle process completion
            child.on('close', (code) => {
                clearInterval(heartbeatInterval);
                if (code === 0) {
                    logger_1.default.info({ command }, 'OpenTofu finished successfully');
                    resolve(stdout.trim());
                }
                else {
                    logger_1.default.error({ code, command, stderr: stderr.trim() }, 'OpenTofu failed');
                    reject(new Error(`${command} failed with exit code ${code}: ${stderr.trim()}`));
                }
            });
        });
    });
}
function writeTfVarsJsonFile(data) {
    return __awaiter(this, void 0, void 0, function* () {
        fs.writeFileSync(data.outputPath, JSON.stringify(data.tfVarsJsonData, null, 2));
        return data.outputPath;
    });
}
