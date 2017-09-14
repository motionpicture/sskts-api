/**
 * action router
 * アクションルーター
 * @module actionsRouter
 */

import * as sskts from '@motionpicture/sskts-domain';
import { Router } from 'express';
import { CREATED } from 'http-status';

import authentication from '../middlewares/authentication';
import permitScopes from '../middlewares/permitScopes';
import validator from '../middlewares/validator';

const actionsRouter = Router();
actionsRouter.use(authentication);

/**
 * チケット印刷アクション追加
 */
actionsRouter.post(
    '/print/ticket',
    permitScopes(['actions']),
    validator,
    async (req, res, next) => {
        try {
            const ticket = {
                ticketToken: req.body.ticketToken
            };

            const action = await new sskts.repository.action.Print(sskts.mongoose.connection).printTicket(
                req.getUser().sub,
                ticket
            );

            res.status(CREATED).json(action);
        } catch (error) {
            next(error);
        }
    });

/**
 * チケット印刷アクション検索
 */
actionsRouter.get(
    '/print/ticket',
    permitScopes(['actions', 'actions.read-only']),
    validator,
    async (req, res, next) => {
        try {
            const actions = await new sskts.repository.action.Print(sskts.mongoose.connection).searchPrintTicket({
                agentId: req.getUser().sub,
                ticketToken: req.query.ticketToken
            });

            res.json(actions);
        } catch (error) {
            next(error);
        }
    });

export default actionsRouter;
