/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),
/* 2 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const common_1 = __webpack_require__(3);
const datahub_1 = __webpack_require__(4);
const auth_1 = __webpack_require__(19);
const core_1 = __webpack_require__(1);
const game_exception_filter_1 = __webpack_require__(25);
const session_guard_1 = __webpack_require__(29);
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            datahub_1.DbModule,
            auth_1.SessionModule,
        ],
        providers: [
            {
                provide: core_1.APP_FILTER,
                useClass: game_exception_filter_1.GameExceptionFilter,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: session_guard_1.SessionGuard,
            },
        ],
    })
], AppModule);


/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),
/* 4 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(5), exports);
__exportStar(__webpack_require__(12), exports);
__exportStar(__webpack_require__(16), exports);


/***/ }),
/* 5 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(6), exports);
__exportStar(__webpack_require__(11), exports);


/***/ }),
/* 6 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DbModule = void 0;
const common_1 = __webpack_require__(3);
const typeorm_1 = __webpack_require__(7);
const config_1 = __webpack_require__(8);
const db_utils_1 = __webpack_require__(9);
const path_1 = __webpack_require__(10);
let DbModule = class DbModule {
};
exports.DbModule = DbModule;
exports.DbModule = DbModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: (0, path_1.resolve)(process.cwd(), `.env`),
            }),
            typeorm_1.TypeOrmModule.forRoot((0, db_utils_1.buildTypeOrmConfig)(process.env)),
        ],
    })
], DbModule);


/***/ }),
/* 7 */
/***/ ((module) => {

module.exports = require("@nestjs/typeorm");

/***/ }),
/* 8 */
/***/ ((module) => {

module.exports = require("@nestjs/config");

/***/ }),
/* 9 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.buildTypeOrmConfig = buildTypeOrmConfig;
function buildTypeOrmConfig(env) {
    return {
        type: 'mysql',
        host: env.DB_HOST,
        port: parseInt(env.DB_PORT ?? '3306'),
        username: env.DB_USERNAME,
        password: env.DB_PASSWORD,
        database: env.DB_NAME,
        autoLoadEntities: true,
        synchronize: false,
        retryAttempts: 5,
        retryDelay: 3000,
        extra: {
            connectionLimit: 20,
            queueLimit: 300,
            connectTimeout: 3000,
        },
        logging: env.DB_LOGGING === 'true',
    };
}


/***/ }),
/* 10 */
/***/ ((module) => {

module.exports = require("path");

/***/ }),
/* 11 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DbService = void 0;
const common_1 = __webpack_require__(3);
let DbService = class DbService {
};
exports.DbService = DbService;
exports.DbService = DbService = __decorate([
    (0, common_1.Injectable)()
], DbService);


/***/ }),
/* 12 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(13), exports);
__exportStar(__webpack_require__(14), exports);


/***/ }),
/* 13 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RedisCacheModule = void 0;
const common_1 = __webpack_require__(3);
const redis_service_1 = __webpack_require__(14);
let RedisCacheModule = class RedisCacheModule {
};
exports.RedisCacheModule = RedisCacheModule;
exports.RedisCacheModule = RedisCacheModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [redis_service_1.RedisCacheService],
        exports: [redis_service_1.RedisCacheService],
    })
], RedisCacheModule);


/***/ }),
/* 14 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RedisCacheService = void 0;
const common_1 = __webpack_require__(3);
const redis_1 = __webpack_require__(15);
let RedisCacheService = class RedisCacheService {
    client;
    constructor() {
        this.client = (0, redis_1.createClient)({
            socket: {
                host: process.env.REDIS_HOST,
                port: +(process.env.REDIS_PORT ?? 3306),
                reconnectStrategy: (retries) => Math.min(retries * 100, 2000),
            },
            database: +(process.env.REDIS_DB_INDEX ?? 0),
        });
        this.client.on('error', err => {
            console.error('[RedisCacheService] Redis Error', err);
        });
    }
    async onModuleInit() {
        await this.client.connect();
    }
    async onModuleDestroy() {
        await this.client.disconnect();
    }
    getClient() {
        return this.client;
    }
};
exports.RedisCacheService = RedisCacheService;
exports.RedisCacheService = RedisCacheService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], RedisCacheService);


/***/ }),
/* 15 */
/***/ ((module) => {

module.exports = require("redis");

/***/ }),
/* 16 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(17), exports);
__exportStar(__webpack_require__(18), exports);


/***/ }),
/* 17 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InMemoryCacheModule = void 0;
const common_1 = __webpack_require__(3);
const in_memory_service_1 = __webpack_require__(18);
let InMemoryCacheModule = class InMemoryCacheModule {
};
exports.InMemoryCacheModule = InMemoryCacheModule;
exports.InMemoryCacheModule = InMemoryCacheModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [in_memory_service_1.InMemoryCacheService],
        exports: [in_memory_service_1.InMemoryCacheService],
    })
], InMemoryCacheModule);


/***/ }),
/* 18 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InMemoryCacheService = void 0;
const common_1 = __webpack_require__(3);
let InMemoryCacheService = class InMemoryCacheService {
    store = new Map();
    set(key, value, ttlMs) {
        this.store.set(key, value);
        if (ttlMs) {
            setTimeout(() => this.store.delete(key), ttlMs);
        }
    }
    get(key) {
        return this.store.get(key);
    }
};
exports.InMemoryCacheService = InMemoryCacheService;
exports.InMemoryCacheService = InMemoryCacheService = __decorate([
    (0, common_1.Injectable)()
], InMemoryCacheService);


/***/ }),
/* 19 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(20), exports);
__exportStar(__webpack_require__(22), exports);
__exportStar(__webpack_require__(24), exports);


/***/ }),
/* 20 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JwtService = void 0;
const common_1 = __webpack_require__(3);
const jsonwebtoken_1 = __webpack_require__(21);
let JwtService = class JwtService {
    secret = process.env.JWT_SECRET || 'secret';
    expiresIn = '1h';
    sign(payload) {
        return (0, jsonwebtoken_1.sign)(payload, this.secret, { expiresIn: this.expiresIn });
    }
    verify(token) {
        return (0, jsonwebtoken_1.verify)(token, this.secret);
    }
};
exports.JwtService = JwtService;
exports.JwtService = JwtService = __decorate([
    (0, common_1.Injectable)()
], JwtService);


/***/ }),
/* 21 */
/***/ ((module) => {

module.exports = require("jsonwebtoken");

/***/ }),
/* 22 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SessionService = void 0;
const common_1 = __webpack_require__(3);
const datahub_1 = __webpack_require__(4);
const ulid_1 = __webpack_require__(23);
let SessionService = class SessionService {
    redisCache;
    client;
    TTL_SECONDS = 3600;
    constructor(redisCache) {
        this.redisCache = redisCache;
        this.client = this.redisCache.getClient();
    }
    async createSession(data) {
        const sessionId = (0, ulid_1.ulid)();
        await this.client.set(`session:${sessionId}`, JSON.stringify(data), { EX: this.TTL_SECONDS });
        return sessionId;
    }
    async get(sessionId) {
        const raw = await this.client.get(`session:${sessionId}`);
        if (!raw)
            throw new common_1.UnauthorizedException('세션이 유효하지 않습니다.');
        return JSON.parse(raw);
    }
    async touch(sessionId) {
        await this.client.expire(`session:${sessionId}`, this.TTL_SECONDS);
    }
    async set(sessionId, data) {
        await this.client.set(`session:${sessionId}`, JSON.stringify(data), { EX: this.TTL_SECONDS });
    }
};
exports.SessionService = SessionService;
exports.SessionService = SessionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof datahub_1.RedisCacheService !== "undefined" && datahub_1.RedisCacheService) === "function" ? _a : Object])
], SessionService);


/***/ }),
/* 23 */
/***/ ((module) => {

module.exports = require("ulid");

/***/ }),
/* 24 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SessionModule = void 0;
const common_1 = __webpack_require__(3);
const session_service_1 = __webpack_require__(22);
const datahub_1 = __webpack_require__(4);
let SessionModule = class SessionModule {
};
exports.SessionModule = SessionModule;
exports.SessionModule = SessionModule = __decorate([
    (0, common_1.Module)({
        imports: [datahub_1.RedisCacheModule],
        providers: [session_service_1.SessionService],
        exports: [session_service_1.SessionService],
    })
], SessionModule);


/***/ }),
/* 25 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GameExceptionFilter = void 0;
const common_1 = __webpack_require__(3);
const rxjs_1 = __webpack_require__(26);
const game_exception_1 = __webpack_require__(27);
let GameExceptionFilter = class GameExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToRpc();
        const callback = ctx.getContext();
        const errorPayload = exception.getError();
        callback(null, errorPayload);
        return (0, rxjs_1.of)();
    }
};
exports.GameExceptionFilter = GameExceptionFilter;
exports.GameExceptionFilter = GameExceptionFilter = __decorate([
    (0, common_1.Catch)(game_exception_1.GameException)
], GameExceptionFilter);


/***/ }),
/* 26 */
/***/ ((module) => {

module.exports = require("rxjs");

/***/ }),
/* 27 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GameException = exports.GameErrorCode = void 0;
const microservices_1 = __webpack_require__(28);
var GameErrorCode;
(function (GameErrorCode) {
    GameErrorCode[GameErrorCode["ACCOUNT_NOEXISTED"] = 1001] = "ACCOUNT_NOEXISTED";
    GameErrorCode[GameErrorCode["ACCOUNT_UNREGISTERED"] = 1002] = "ACCOUNT_UNREGISTERED";
    GameErrorCode[GameErrorCode["SESSION_INVALID"] = 2001] = "SESSION_INVALID";
})(GameErrorCode || (exports.GameErrorCode = GameErrorCode = {}));
class GameException extends microservices_1.RpcException {
    errorCode;
    constructor(errorCode, message) {
        super({
            code: errorCode,
            message,
        });
        this.errorCode = errorCode;
    }
}
exports.GameException = GameException;


/***/ }),
/* 28 */
/***/ ((module) => {

module.exports = require("@nestjs/microservices");

/***/ }),
/* 29 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SessionGuard = void 0;
const common_1 = __webpack_require__(3);
const auth_1 = __webpack_require__(19);
const core_1 = __webpack_require__(1);
const public_decorator_1 = __webpack_require__(30);
let SessionGuard = class SessionGuard {
    sessionService;
    reflector;
    constructor(sessionService, reflector) {
        this.sessionService = sessionService;
        this.reflector = reflector;
    }
    async canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(public_decorator_1.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        const args = context.getArgs();
        const metadata = args[1];
        const call = args[2];
        const sessionIds = metadata.get('session-id');
        const sessionId = Array.isArray(sessionIds) && sessionIds.length > 0
            ? sessionIds[0]
            : null;
        if (!sessionId) {
            throw new common_1.UnauthorizedException('세션 ID가 없습니다.');
        }
        const session = await this.sessionService.get(sessionId);
        await this.sessionService.touch(sessionId);
        call.session = session;
        return true;
    }
};
exports.SessionGuard = SessionGuard;
exports.SessionGuard = SessionGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof auth_1.SessionService !== "undefined" && auth_1.SessionService) === "function" ? _a : Object, typeof (_b = typeof core_1.Reflector !== "undefined" && core_1.Reflector) === "function" ? _b : Object])
], SessionGuard);


/***/ }),
/* 30 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Public = exports.IS_PUBLIC_KEY = void 0;
const common_1 = __webpack_require__(3);
exports.IS_PUBLIC_KEY = 'isPublic';
const Public = () => (0, common_1.SetMetadata)(exports.IS_PUBLIC_KEY, true);
exports.Public = Public;


/***/ }),
/* 31 */
/***/ ((module) => {

module.exports = require("fs");

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
const core_1 = __webpack_require__(1);
const app_module_1 = __webpack_require__(2);
const microservices_1 = __webpack_require__(28);
const common_1 = __webpack_require__(3);
const path_1 = __webpack_require__(10);
const fs_1 = __webpack_require__(31);
async function bootstrap() {
    const protoBasePath = getProtoBasePath();
    const protoList = getProtoList(protoBasePath);
    const defaultOptions = {
        transport: microservices_1.Transport.GRPC,
        options: {
            package: 'jhha.butterfly.v1',
            protoPath: protoList,
            keepalive: {
                keepaliveTimeMs: 5 * 60 * 1000,
                keepaliveTimeoutMs: 20 * 1000,
                keepalivePermitWithoutCalls: 1,
                http2MinPingIntervalWithoutDataMs: 30 * 1000,
                http2MaxPingStrikes: 2,
            },
            loader: {
                keepCase: false,
                longs: String,
                enums: String,
                defaults: true,
                oneofs: true,
                includeDirs: [protoBasePath],
            },
        },
    };
    defaultOptions.options.url = '0.0.0.0:50051';
    const app = await core_1.NestFactory.createMicroservice(app_module_1.AppModule, {
        ...defaultOptions,
    });
    await app.listen();
    common_1.Logger.log(`🚀 Simple Game Server is running on gRPC ${defaultOptions.options.url}`);
}
function getProtoBasePath() {
    return (0, path_1.join)(__dirname, 'grpc', 'proto');
}
function getProtoList(basePath) {
    const result = [];
    const walk = (dir) => {
        for (const d of (0, fs_1.readdirSync)(dir, { withFileTypes: true })) {
            const full = (0, path_1.join)(dir, d.name);
            if (d.isDirectory()) {
                walk(full);
            }
            else if (d.isFile() && full.endsWith('.proto')) {
                result.push(full);
            }
        }
    };
    walk(basePath);
    return result;
}
bootstrap();

})();

/******/ })()
;