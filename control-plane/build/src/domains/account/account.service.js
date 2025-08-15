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
exports.createAccountTx = createAccountTx;
exports.listAccount = listAccount;
exports.describeAccount = describeAccount;
exports.editAccount = editAccount;
exports.deleteAccount = deleteAccount;
exports.getAccountPlan = getAccountPlan;
const AccountBillingService = __importStar(require("@domains/account/accountBilling.service"));
const AccountMemberService = __importStar(require("@domains/account/accountMember.service"));
const AccountNetworkService = __importStar(require("@domains/account/accountNetwork.service"));
const AccountStorageService = __importStar(require("@domains/account/accountStorage.service"));
const client_1 = require("@prisma/client");
const config_1 = __importDefault(require("@/config/config"));
const logger_1 = __importDefault(require("@/config/logger"));
const api_1 = require("@/utils/api");
const role_service_1 = require("../permission/role.service");
const account_select_1 = require("./account.select");
const account_type_1 = require("./account.type");
const prisma = new client_1.PrismaClient();
/******************************************************************************
 * Create an account
 *****************************************************************************/
function createAccountTx(tx, data) {
    return __awaiter(this, void 0, void 0, function* () {
        // Get systemUser
        const systemUser = yield tx.user.findUnique({ where: { email: config_1.default.systemUserEmail } });
        if (!systemUser) {
            throw {
                status: 500,
                message: 'Failed to create account',
            };
        }
        // Create account
        const account = yield tx.account.create({
            data: {
                name: data.name,
                regionId: data.region.id,
                createdById: data.user.id,
            },
        });
        // Assign account membership & role
        const accountOwnerRole = yield (0, role_service_1.getRoleByName)('AccountOwner');
        yield AccountMemberService.createAccountMemberTx(tx, {
            userId: data.user.id,
            accountId: account.id,
            roleId: (accountOwnerRole === null || accountOwnerRole === void 0 ? void 0 : accountOwnerRole.id) || -1,
        });
        // Create account billing
        yield AccountBillingService.createAccountBillingTx(tx, {
            accountId: account.id,
            billingEmail: data.user.email,
        });
        // Create account network
        // If it's default account --> override
        let networkConfig;
        if (data.isDefault) {
            networkConfig = {
                name: 'default',
                providerName: 'AWS',
                config: {
                    vpcId: config_1.default.provisioningFreeTierAWS.vpcId,
                    securityGroupIds: config_1.default.provisioningFreeTierAWS.securityGroupIds,
                    subnetIds: config_1.default.provisioningFreeTierAWS.subnetIds,
                },
            };
        }
        else {
            networkConfig = data.networkConfig;
        }
        // Validate
        logger_1.default.debug({ networkConfig }, 'networkConfig');
        const networkConfigParsed = account_type_1.accountNetworkConfigSchema.safeParse(networkConfig);
        if (!networkConfigParsed.success) {
            throw {
                status: 400,
                message: 'Invalid networkConfig',
                issues: networkConfigParsed.error.format(),
            };
        }
        const accountNetwork = yield AccountNetworkService.createAccountNetworkTx(tx, {
            account: { connect: { id: account.id } },
            networkName: data.name,
            networkConfig: networkConfig,
            createdBy: { connect: { id: data.user.id } },
        });
        // Create account storage
        // If it's default account --> override
        // Prepare configs
        let storageConfig;
        if (data.isDefault) {
            storageConfig = {
                name: 'default',
                providerName: 'AWS',
                dataPath: `s3://${config_1.default.provisioningFreeTierAWS.s3Bucket}/${account.uid}/data`,
                tofuBackend: {
                    type: 's3',
                    bucket: config_1.default.provisioningFreeTierAWS.s3Bucket,
                    key: `${account.uid}/tofuState`,
                    region: config_1.default.provisioningFreeTierAWS.defaultRegion,
                },
            };
        }
        else {
            storageConfig = data.storageConfig;
        }
        // Validate
        logger_1.default.debug({ storageConfig }, 'storageConfig');
        const storageConfigParsed = account_type_1.accountStorageConfigSchema.safeParse(storageConfig);
        if (!storageConfigParsed.success) {
            throw {
                status: 400,
                message: 'Invalid storageConfig',
                issues: storageConfigParsed.error.format(),
            };
        }
        const accountStorage = yield AccountStorageService.createAccountStorageTx(tx, {
            account: { connect: { id: account.id } },
            storageName: 'default',
            storageConfig: storageConfig,
            createdBy: { connect: { id: data.user.id } },
        });
        if (!account) {
            throw {
                status: 500,
                message: 'Failed to create account',
            };
        }
        return {
            account,
            accountStorage,
            accountNetwork,
        };
    });
}
/******************************************************************************
 * List available accounts
 *****************************************************************************/
function listAccount(_a) {
    return __awaiter(this, arguments, void 0, function* ({ userId, name, page = 1, limit = 10 }) {
        const whereClause = {};
        // IMPORTANT: Mandatory filter by userId
        whereClause.members = {
            some: {
                userId,
            },
        };
        // OPTIONALS
        if (name) {
            whereClause.name = {
                contains: name,
                mode: 'insensitive',
            };
        }
        logger_1.default.debug({ userId }, 'Listing accounts for a user');
        const [totalData, accounts] = yield Promise.all([
            prisma.account.count({ where: whereClause }),
            prisma.account.findMany({
                where: whereClause,
                select: account_select_1.describeAccountSelect,
                skip: (0, api_1.offsetPagination)(page, limit),
                take: limit,
            }),
        ]);
        const totalPages = Math.ceil(totalData / limit);
        return {
            data: accounts,
            pagination: {
                currentPage: page,
                totalPages,
                totalData,
                limit,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        };
    });
}
/******************************************************************************
 * Get an account
 *****************************************************************************/
function describeAccount(uid) {
    return __awaiter(this, void 0, void 0, function* () {
        const account = yield prisma.account.findUnique({
            where: { uid },
            select: account_select_1.describeAccountSelect,
        });
        if (!account) {
            throw {
                status: 404,
                message: 'Account not found',
            };
        }
        return account;
    });
}
function editAccount(uid, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const account = yield prisma.account.update({
            where: { uid },
            data,
        });
        if (!account) {
            throw {
                status: 404,
                message: 'Account not found',
            };
        }
        return account;
    });
}
function deleteAccount(uid) {
    return __awaiter(this, void 0, void 0, function* () {
        const account = yield prisma.account.delete({
            where: { uid },
        });
        if (!account) {
            throw {
                status: 404,
                message: 'Account not found',
            };
        }
        return account;
    });
}
function getAccountPlan(uid) {
    return __awaiter(this, void 0, void 0, function* () {
        const account = yield prisma.account.findUnique({ where: { uid } });
        if (!account) {
            throw {
                status: 404,
                message: 'Account not found',
            };
        }
        return account.plan;
    });
}
