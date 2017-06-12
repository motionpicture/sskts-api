/**
 * devルーター
 *
 * @ignore
 */

import * as express from 'express';
const devRouter = express.Router();

import { NO_CONTENT } from 'http-status';
import * as mongoose from 'mongoose';

import mongooseConnectionOptions from '../../mongooseConnectionOptions';

import authentication from '../middlewares/authentication';
import permitScopes from '../middlewares/permitScopes';

devRouter.use(authentication);

devRouter.get(
    '/500',
    () => {
        throw new Error('500 manually');
    });

devRouter.get(
    '/environmentVariables',
    permitScopes(['admin']),
    (__, res) => {
        res.json({
            data: {
                type: 'envs',
                attributes: process.env
            }
        });
    });

devRouter.get(
    '/mongoose/connect',
    (__, res) => {
        mongoose.connect(process.env.MONGOLAB_URI, mongooseConnectionOptions, () => {
            res.status(NO_CONTENT).end();
        });
    });

export default devRouter;
