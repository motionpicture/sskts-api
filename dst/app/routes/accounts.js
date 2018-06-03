"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Pecorino口座ルーター
 */
const sskts = require("@motionpicture/sskts-domain");
// import * as createDebug from 'debug';
const express_1 = require("express");
const http_status_1 = require("http-status");
const authentication_1 = require("../middlewares/authentication");
const permitScopes_1 = require("../middlewares/permitScopes");
const validator_1 = require("../middlewares/validator");
const accountsRouter = express_1.Router();
// const debug = createDebug('sskts-api:routes:accounts');
const pecorinoAuthClient = new sskts.pecorinoapi.auth.ClientCredentials({
    domain: process.env.PECORINO_AUTHORIZE_SERVER_DOMAIN,
    clientId: process.env.PECORINO_API_CLIENT_ID,
    clientSecret: process.env.PECORINO_API_CLIENT_SECRET,
    scopes: [],
    state: ''
});
accountsRouter.use(authentication_1.default);
/**
 * 管理者として口座に入金する
 * [username]の所有する口座に対して入金処理を実行する
 */
accountsRouter.post('/transactions/deposit', permitScopes_1.default(['admin']), (req, __, next) => {
    req.checkBody('recipient', 'invalid recipient').notEmpty().withMessage('recipient is required');
    req.checkBody('amount', 'invalid amount').notEmpty().withMessage('amount is required').isInt();
    req.checkBody('toAccountNumber', 'invalid toAccountNumber').notEmpty().withMessage('toAccountNumber is required');
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const accountRepo = new sskts.repository.Account({
            endpoint: process.env.PECORINO_API_ENDPOINT,
            authClient: pecorinoAuthClient
        });
        yield accountRepo.deposit({
            toAccountNumber: req.body.toAccountNumber,
            agent: {
                id: req.user.sub,
                name: (req.user.username !== undefined) ? req.user.username : req.user.sub,
                url: ''
            },
            recipient: req.body.recipient,
            amount: parseInt(req.body.amount, 10),
            notes: (req.body.notes !== undefined) ? req.body.notes : 'シネマサンシャイン入金'
        });
        res.status(http_status_1.NO_CONTENT).end();
    }
    catch (error) {
        next(error);
    }
}));
exports.default = accountsRouter;
