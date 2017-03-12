/**
 * devルーター
 *
 * @ignore
 */
import * as express from 'express';
const router = express.Router();

import * as createDebug from 'debug';
import * as httpStatus from 'http-status';
import * as mongoose from 'mongoose';

const debug = createDebug('sskts-api:*');

router.get(
    '/500',
    () => {
        throw new Error('500 manually');
    });

router.get(
    '/environmentVariables',
    (req, res) => {
        debug('ip:', req.ip);
        res.json({
            data: {
                type: 'envs',
                attributes: process.env
            }
        });
    });

router.get(
    '/mongoose/connect',
    (req, res, next) => {
        debug('ip:', req.ip);
        mongoose.connect(process.env.MONGOLAB_URI, (err: Error) => {
            if (err) {
                return next(err);
            }

            res.status(httpStatus.NO_CONTENT).end();
        });
    });

router.get(
    '/mongoose/disconnect',
    (req, res, next) => {
        debug('ip:', req.ip);
        mongoose.disconnect((err) => {
            if (err) {
                return next(err);
            }

            res.status(httpStatus.NO_CONTENT).end();
        });
    });

export default router;
