/**
 * 健康チェックルーター
 *
 * @ignore
 */
import * as express from 'express';
const router = express.Router();

import * as createDebug from 'debug';
import * as HTTPStatus from 'http-status';
import * as mongoose from 'mongoose';

const debug = createDebug('sskts-api:router:health');
const MONGOOSE_CONNECTION_READY_STATE_CONNECTED = 1;

router.get('', (_req, res, next) => { // tslint:disable-line:variable-name
    debug('mongoose.connection.readyState is', mongoose.connection.readyState);

    // mongodb接続状態チェック
    if (mongoose.connection.readyState !== MONGOOSE_CONNECTION_READY_STATE_CONNECTED) {
        debug('connecting mongodb...');
        mongoose.connect(process.env.MONGOLAB_URI, (err: Error) => {
            if (err) {
                return next(err);
            }

            res.status(HTTPStatus.OK).send('healty');
        });

    } else {
        res.status(HTTPStatus.OK).send('healty');
    }
});

export default router;
