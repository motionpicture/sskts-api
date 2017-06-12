/**
 * 健康チェックルーター
 *
 * @ignore
 */

import * as express from 'express';
const healthRouter = express.Router();

import * as createDebug from 'debug';
import { OK } from 'http-status';
import * as mongoose from 'mongoose';

import mongooseConnectionOptions from '../../mongooseConnectionOptions';
import * as redisClient from '../../redisClient';

const debug = createDebug('sskts-api:healthRouter');
const MONGOOSE_CONNECTION_READY_STATE_CONNECTED = 1;

healthRouter.get(
    '',
    async (_, res, next) => {
        debug('mongoose.connection.readyState:', mongoose.connection.readyState);
        debug('redisClient.connected:', redisClient.default.connected);

        try {
            await Promise.all([
                new Promise((resolve, reject) => {
                    // mongodb接続状態チェック
                    if (mongoose.connection.readyState === MONGOOSE_CONNECTION_READY_STATE_CONNECTED) {
                        resolve();

                        return;
                    }

                    debug('connecting mongodb...');
                    mongoose.connect(process.env.MONGOLAB_URI, mongooseConnectionOptions, (err) => {
                        if (err instanceof Error) {
                            reject(err);

                            return;
                        }

                        res.status(OK).send('healthy!');
                    });
                }),
                new Promise(async (resolve, reject) => {
                    if (redisClient.default.connected) {
                        resolve();
                    } else {
                        reject(new Error('redis unconnected'));
                    }
                })
            ]);

            res.status(OK).send('healthy!');
        } catch (error) {
            next(error);
        }
    });

export default healthRouter;
