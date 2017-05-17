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

const debug = createDebug('sskts-api:healthRouter:health');
const MONGOOSE_CONNECTION_READY_STATE_CONNECTED = 1;

healthRouter.get(
    '',
    (_, res, next) => {
        debug('mongoose.connection.readyState is', mongoose.connection.readyState);

        // mongodb接続状態チェック
        if (mongoose.connection.readyState !== MONGOOSE_CONNECTION_READY_STATE_CONNECTED) {
            debug('connecting mongodb...');
            mongoose.connect(process.env.MONGOLAB_URI, mongooseConnectionOptions, (err) => {
                if (err instanceof Error) {
                    next(err);

                    return;
                }

                res.status(OK).send('healthy!');
            });
        } else {
            res.status(OK).send('healthy!');
        }
    });

export default healthRouter;
