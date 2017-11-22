"use strict";
/**
 * 接続回数制限ミドルウェア
 * @module middlewares.rateLimit
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const createDebug = require("debug");
// import { BAD_REQUEST } from 'http-status';
const redis = require("ioredis");
const moment = require("moment");
// import { APIError } from '../error/api';
const debug = createDebug('sskts-api:middlewares:rateLimit');
/**
 * リクエスト数カウンターレポジトリー
 * @class
 */
class RequestCounterRepository {
    constructor(redisClient) {
        this.redisClient = redisClient;
    }
    static CREATE_COUNTER_UNIT_PARAMS(now, rule) {
        const dateNow = moment(now);
        // tslint:disable-next-line:no-magic-numbers
        const aggregationUnitInSeconds = parseInt(rule.aggregationUnitInSeconds.toString(), 10);
        const validFrom = dateNow.unix() - dateNow.unix() % aggregationUnitInSeconds;
        const validThrough = validFrom + aggregationUnitInSeconds;
        return {
            identifier: `${rule.scope}.${validFrom.toString()}`,
            validFrom: validFrom,
            validThrough: validThrough
        };
    }
    /**
     * 許可証数をカウントアップする
     * @param {Date} issueDate 発行日時
     * @param {IRule} rule 発行ルール
     */
    incr(now, rule) {
        return __awaiter(this, void 0, void 0, function* () {
            const issueUnitParams = RequestCounterRepository.CREATE_COUNTER_UNIT_PARAMS(now, rule);
            // tslint:disable-next-line:no-magic-numbers
            const ttl = parseInt(rule.aggregationUnitInSeconds.toString(), 10);
            const results = yield this.redisClient.multi()
                .incr(issueUnitParams.identifier, debug)
                .expire(issueUnitParams.identifier, ttl, debug)
                .exec();
            debug('results:', results);
            // tslint:disable-next-line:no-magic-numbers
            return parseInt(results[0][1], 10);
        });
    }
}
exports.RequestCounterRepository = RequestCounterRepository;
exports.default = (configurations) => {
    const redisClient = new redis({
        // tslint:disable-next-line:no-magic-numbers
        port: parseInt(process.env.REDIS_PORT, 10),
        host: process.env.REDIS_HOST,
        password: process.env.REDIS_KEY,
        tls: { servername: process.env.REDIS_HOST }
    });
    const requestCounterRepo = new RequestCounterRepository(redisClient);
    return (__1, __2, next) => __awaiter(this, void 0, void 0, function* () {
        // 接続回数をincrement
        const now = moment();
        const numberOfRequests = yield requestCounterRepo.incr(now.toDate(), configurations);
        const isLimitExceeded = (numberOfRequests > configurations.threshold);
        if (isLimitExceeded) {
            // tslint:disable-next-line:no-suspicious-comment
            // TODO エラークラス対応
            // next(new sskts.factory.errors.RateLimitExceeded());
            next(new Error('RateLimitExceeded.'));
        }
        else {
            next();
        }
    });
};
