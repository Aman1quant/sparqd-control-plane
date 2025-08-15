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
Object.defineProperty(exports, "__esModule", { value: true });
exports.onboardNewUser = onboardNewUser;
const AccountService = __importStar(require("@domains/account/account.service"));
const role_service_1 = require("@domains/permission/role.service");
const UserService = __importStar(require("@domains/user/user.service"));
const client_1 = require("@prisma/client");
const workspace_service_1 = require("../workspace/workspace.service");
const workspaceMember_service_1 = require("../workspace/workspaceMember.service");
// import * as AuditService from './audit.service';
const prisma = new client_1.PrismaClient();
function onboardNewUser(input) {
    return __awaiter(this, void 0, void 0, function* () {
        // Step 1: DB transaction — user/account creation
        const user = yield prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
            const user = yield UserService.createUserTx(tx, {
                email: input.email,
                kcSub: input.kcSub,
                fullName: input.fullName,
                avatarUrl: input.avatarUrl,
            });
            const region = yield prisma.region.findUnique({
                where: {
                    name_cloudProviderId: {
                        cloudProviderId: 1,
                        name: 'ap-southeast-1',
                    },
                },
            });
            if (!region) {
                throw {
                    status: 404,
                    message: 'Region not found',
                };
            }
            const account = yield AccountService.createAccountTx(tx, {
                name: 'default',
                region,
                user,
                plan: 'FREE',
                networkConfig: {
                    name: 'default',
                    providerName: 'AWS',
                    config: {
                        vpcId: 'toBeReplaced',
                        securityGroupIds: ['toBeReplaced'],
                        subnetIds: ['toBeReplaced'],
                    },
                },
                storageConfig: {
                    name: 'default',
                    providerName: 'AWS',
                    dataPath: 'toBeReplaced',
                    tofuBackend: {
                        type: 's3',
                        bucket: 'toBeReplaced',
                        key: 'toBeReplaced',
                        region: 'toBeReplaced',
                    },
                },
                isDefault: true,
            });
            const workspace = yield (0, workspace_service_1.createWorkspaceTx)(tx, {
                account: { connect: { id: account.account.id } },
                name: 'default',
                description: 'default',
                storage: { connect: { id: account.accountStorage.id } },
                network: { connect: { id: account.accountNetwork.id } },
                metadata: {},
                createdBy: { connect: { id: user.id } },
            });
            const workspaceOwnerRole = yield (0, role_service_1.getRoleByName)('WorkspaceOwner');
            yield (0, workspaceMember_service_1.createWorkspaceMemberTx)(tx, {
                workspaceId: workspace.id,
                userId: user.id,
                roleId: (workspaceOwnerRole === null || workspaceOwnerRole === void 0 ? void 0 : workspaceOwnerRole.id) || -1,
            });
            // TODO
            // await AuditService.logAuditTx(tx, [
            //   {
            //     userId: user.id,
            //     accountId: account.id,
            //     action: 'USER_ACCOUNT_INITIALIZED',
            //   },
            // ]);
            return {
                user,
                account,
            };
        }));
        // Step 2: Provision new realm
        // await provisionNewRealm(user.account.uid);
        // Step 3: Mark account kcRealmStatus as FINALIZED
        // await AccountService.editAccount(user.account.uid, { kcRealmStatus: 'FINALIZED' });
        const finalUser = yield UserService.getUserByKcSub(user.user.kcSub);
        return finalUser;
    });
}
