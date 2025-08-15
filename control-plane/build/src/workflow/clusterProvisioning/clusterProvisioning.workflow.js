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
exports.provisionClusterWorkflow = provisionClusterWorkflow;
const workflow_1 = require("@temporalio/workflow");
const logger_1 = __importDefault(require("../utils/logger"));
const { createTofuDir, getTofuTemplate, prepareTfVarsJsonFile, updateClusterStatus, tofuInit, tofuPlan, tofuApply, tofuDestroy, cleanupTofuDir } = (0, workflow_1.proxyActivities)({
    startToCloseTimeout: '1 hour',
    heartbeatTimeout: '30 seconds',
    retry: {
        maximumAttempts: 1,
        initialInterval: '5s',
        backoffCoefficient: 2,
        maximumInterval: '10s',
    },
});
function provisionClusterWorkflow(op, input) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.default.info({ input }, 'provisionClusterWorkflow');
        let operationSucceeded = false;
        let initialState, progressingState, failedState, successState;
        switch (op) {
            case 'CREATE':
                initialState = 'PENDING';
                progressingState = 'CREATING';
                failedState = 'CREATE_FAILED';
                successState = 'RUNNING';
                break;
            case 'UPDATE':
                initialState = 'RUNNING';
                progressingState = 'UPDATING';
                failedState = 'UPDATE_FAILED';
                successState = 'RUNNING';
                break;
            case 'DELETE':
                initialState = 'RUNNING';
                progressingState = 'DELETING';
                failedState = 'DELETE_FAILED';
                successState = 'DELETED';
                break;
            default:
                throw workflow_1.ApplicationFailure.create({ message: 'Failed preparing provisionClusterWorkflow' });
        }
        // Initiate status from initialState --> progressingState
        yield updateClusterStatus(input.clusterUid, initialState, progressingState);
        // Create temporary Tofu working dir
        const tmpDir = yield createTofuDir(input.clusterUid);
        if (!tmpDir) {
            yield updateClusterStatus(input.clusterUid, progressingState, failedState);
            throw workflow_1.ApplicationFailure.create({ message: 'Failed creating temporary Tofu directory' });
        }
        try {
            // Copy Tofu template to tmpDir
            const tofuDir = yield getTofuTemplate(input.tofuTemplateDir || 'noexists', tmpDir);
            if (!tofuDir) {
                yield updateClusterStatus(input.clusterUid, progressingState, failedState);
                throw workflow_1.ApplicationFailure.create({ message: 'Failed getting Tofu template' });
            }
            else {
                logger_1.default.info(`Tofu working directory: ${tofuDir}`);
            }
            // Final tofu working dir
            const tofuWorkingDir = `${tofuDir}/${input.tofuTemplatePath}`;
            // Write env.tfvars.json from input
            const tfVarsJsonPath = yield prepareTfVarsJsonFile(input.tofuTfvars, tofuWorkingDir);
            if (!tfVarsJsonPath) {
                yield updateClusterStatus(input.clusterUid, progressingState, failedState);
                throw workflow_1.ApplicationFailure.create({ message: 'Failed preparing env.tfvars.json' });
            }
            // Run tofu init
            const initOut = yield tofuInit(tofuWorkingDir, input.tofuBackendConfig);
            if (!initOut) {
                yield updateClusterStatus(input.clusterUid, progressingState, failedState);
                throw workflow_1.ApplicationFailure.create({ message: 'tofu init failed' });
            }
            // Business logic based on op
            switch (op) {
                case 'CREATE': {
                    const planOut = yield tofuPlan(tofuWorkingDir);
                    if (!planOut) {
                        yield updateClusterStatus(input.clusterUid, progressingState, failedState);
                        throw workflow_1.ApplicationFailure.create({ message: 'tofu plan failed' });
                    }
                    const applyOut = yield tofuApply(tofuWorkingDir);
                    if (!applyOut) {
                        yield updateClusterStatus(input.clusterUid, progressingState, failedState);
                        throw workflow_1.ApplicationFailure.create({ message: 'tofu apply failed' });
                    }
                    yield updateClusterStatus(input.clusterUid, progressingState, successState);
                    operationSucceeded = true;
                    break;
                }
                case 'DELETE': {
                    const destroyOut = yield tofuDestroy(tofuWorkingDir);
                    if (!destroyOut) {
                        yield updateClusterStatus(input.clusterUid, progressingState, failedState);
                        throw workflow_1.ApplicationFailure.create({ message: 'tofu destroy failed' });
                    }
                    yield updateClusterStatus(input.clusterUid, progressingState, successState);
                    operationSucceeded = true;
                    break;
                }
                default: {
                    yield updateClusterStatus(input.clusterUid, progressingState, failedState);
                    throw workflow_1.ApplicationFailure.create({
                        message: `Unsupported operation: ${op}`,
                    });
                }
            }
        }
        catch (error) {
            yield updateClusterStatus(input.clusterUid, progressingState, failedState);
            throw workflow_1.ApplicationFailure.create({
                message: 'Unknown failure occurred',
                details: [error],
            });
        }
        finally {
            // Always cleanup
            yield cleanupTofuDir(tmpDir);
        }
        if (operationSucceeded) {
            return 'ok';
        }
        throw workflow_1.ApplicationFailure.create({
            message: 'Unknown failure occurred',
        });
    });
}
