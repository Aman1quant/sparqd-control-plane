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
exports.startClusterWorkflow = startClusterWorkflow;
const temporal_client_1 = require("@/config/clients/temporal.client");
const clusterProvisioning_workflow_1 = require("@/workflow/clusterProvisioning/clusterProvisioning.workflow");
const logger_1 = __importDefault(require("@/workflow/utils/logger"));
/******************************************************************************
 * Start cluster workflow wrapper
 *****************************************************************************/
function startClusterWorkflow(op, arg) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.default.debug({ arg }, 'startClusterWorkflow Invoked');
        const temporalClient = yield (0, temporal_client_1.connectTemporalClient)();
        const handle = yield temporalClient.workflow.start(clusterProvisioning_workflow_1.provisionClusterWorkflow, {
            args: [op, arg],
            taskQueue: 'clusterProvisioning',
            workflowId: `clusterProvisioning/${op}/${arg.clusterUid}/${Date.now()}`,
        });
        return handle;
    });
}
