/**
 * devルーター
 *
 * @ignore
 */
import * as express from 'express';
const router = express.Router();

import * as createDebug from 'debug';
import * as HTTPStatus from 'http-status';
import * as mongoose from 'mongoose';

const debug = createDebug('sskts-api:*');

// middleware that is specific to this router
// router.use((req, res, next) => {
//   debug('Time: ', Date.now())
//   next()
// })

router.get('/environmentVariables', (req, res) => {
    debug('ip:', req.ip);
    // this.logger.debug('process.env:', process.env);
    res.json({
        data: {
            type: 'envs',
            attributes: process.env
        }
    });
});

router.get('/mongoose/connect', (req, res, next) => {
    debug('ip:', req.ip);
    mongoose.connect(process.env.MONGOLAB_URI, (err: Error) => {
        if (err) {
            return next(err);
        }

        res.status(HTTPStatus.NO_CONTENT).end();
    });
});

router.get('/mongoose/disconnect', (req, res, next) => {
    debug('ip:', req.ip);
    mongoose.disconnect((err) => {
        if (err) {
            return next(err);
        }

        res.status(HTTPStatus.NO_CONTENT).end();
    });
});

export default router;
