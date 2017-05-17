"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 健康チェックルーター
 *
 * @ignore
 */
const express = require("express");
const healthRouter = express.Router();
const createDebug = require("debug");
const http_status_1 = require("http-status");
const mongoose = require("mongoose");
const mongooseConnectionOptions_1 = require("../../mongooseConnectionOptions");
const debug = createDebug('sskts-api:healthRouter:health');
const MONGOOSE_CONNECTION_READY_STATE_CONNECTED = 1;
healthRouter.get('', (_, res, next) => {
    debug('mongoose.connection.readyState is', mongoose.connection.readyState);
    // mongodb接続状態チェック
    if (mongoose.connection.readyState !== MONGOOSE_CONNECTION_READY_STATE_CONNECTED) {
        debug('connecting mongodb...');
        mongoose.connect(process.env.MONGOLAB_URI, mongooseConnectionOptions_1.default, (err) => {
            if (err instanceof Error) {
                next(err);
                return;
            }
            res.status(http_status_1.OK).send('healthy!');
        });
    }
    else {
        res.status(http_status_1.OK).send('healthy!');
    }
});
exports.default = healthRouter;
