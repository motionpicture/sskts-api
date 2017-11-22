/**
 * 接続回数制限ミドルウェア
 * @module middlewares.rateLimit
 */

import * as createDebug from 'debug';
import { NextFunction, Request, Response } from 'express';
// import { BAD_REQUEST } from 'http-status';
import * as redis from 'ioredis';
import * as moment from 'moment';

// import { APIError } from '../error/api';

const debug = createDebug('sskts-api:middlewares:rateLimit');

export interface IRule {
    scope: string;
    aggregationUnitInSeconds: number;
    threshold: number;
}

export interface IConfigurations {
    scope: string;
    aggregationUnitInSeconds: number;
    threshold: number;
}

/**
 * リクエスト数カウンターレポジトリー
 * @class
 */
export class RequestCounterRepository {
    public readonly redisClient: redis.Redis;

    constructor(redisClient: redis.Redis) {
        this.redisClient = redisClient;
    }

    public static CREATE_COUNTER_UNIT_PARAMS(now: Date, rule: IRule) {
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
    public async incr(now: Date, rule: IRule): Promise<number> {
        const issueUnitParams = RequestCounterRepository.CREATE_COUNTER_UNIT_PARAMS(now, rule);
        // tslint:disable-next-line:no-magic-numbers
        const ttl = parseInt(rule.aggregationUnitInSeconds.toString(), 10);

        const results = await this.redisClient.multi()
            .incr(issueUnitParams.identifier, debug)
            .expire(issueUnitParams.identifier, ttl, debug)
            .exec();
        debug('results:', results);

        // tslint:disable-next-line:no-magic-numbers
        return parseInt(results[0][1], 10);
    }
}

export default (configurations: IConfigurations) => {
    const redisClient = new redis({
        // tslint:disable-next-line:no-magic-numbers
        port: parseInt(<string>process.env.REDIS_PORT, 10),
        host: <string>process.env.REDIS_HOST,
        password: <string>process.env.REDIS_KEY,
        tls: <any>{ servername: <string>process.env.REDIS_HOST }
    });
    const requestCounterRepo = new RequestCounterRepository(redisClient);

    return async (__1: Request, __2: Response, next: NextFunction) => {
        // 接続回数をincrement
        const now = moment();
        const numberOfRequests = await requestCounterRepo.incr(now.toDate(), configurations);
        const isLimitExceeded = (numberOfRequests > configurations.threshold);

        if (isLimitExceeded) {
            // tslint:disable-next-line:no-suspicious-comment
            // TODO エラークラス対応
            // next(new sskts.factory.errors.RateLimitExceeded());
            next(new Error('RateLimitExceeded.'));
        } else {
            next();
        }
    };
};
