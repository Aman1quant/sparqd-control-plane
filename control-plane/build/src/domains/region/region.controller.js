"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
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
exports.RegionController = void 0;
const tsoa_1 = require("tsoa");
const region_service_1 = require("./region.service");
const logger_1 = __importDefault(require("@/config/logger"));
let RegionController = class RegionController extends tsoa_1.Controller {
    /**
   * List cloud regions with optional filtering by name and pagination.
   * @param name Optional name filter
   * @param page Page number (default: 1)
   * @param limit Items per page (default: 10)
   */
    listCloudRegion(name_1) {
        return __awaiter(this, arguments, void 0, function* (name, page = 1, limit = 10) {
            logger_1.default.debug("GET region");
            try {
                const result = yield (0, region_service_1.listCloudRegion)({
                    name: name || "",
                    page: page || 1,
                    limit: limit || 10,
                });
                return {
                    code: "SUCCESS",
                    message: "Success",
                    errors: [],
                    data: result.data,
                    pagination: result.pagination
                };
            }
            catch (err) {
                const errorResponse = err;
                // this.setStatus(errorResponse.statusCode);
                // throw errorResponse;
                this.setStatus(500); // tells TSOA it’s a 500
                throw { message: errorResponse.message || "Internal Server Error" };
            }
        });
    }
};
exports.RegionController = RegionController;
__decorate([
    (0, tsoa_1.Get)("/"),
    (0, tsoa_1.Response)(500, "Internal Server Error"),
    __param(0, (0, tsoa_1.Query)()),
    __param(1, (0, tsoa_1.Query)()),
    __param(2, (0, tsoa_1.Query)())
], RegionController.prototype, "listCloudRegion", null);
exports.RegionController = RegionController = __decorate([
    (0, tsoa_1.Route)("cloudRegion"),
    (0, tsoa_1.Tags)("CloudRegion")
], RegionController);
