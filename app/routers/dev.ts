/**
 * devルーター
 *
 * @ignore
 */

import * as sskts from '@motionpicture/sskts-domain';
import * as express from 'express';
const devRouter = express.Router();

import { NO_CONTENT } from 'http-status';

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
        sskts.mongoose.connect(process.env.MONGOLAB_URI, <any>mongooseConnectionOptions, () => {
            res.status(NO_CONTENT).end();
        });
    });

export default devRouter;
