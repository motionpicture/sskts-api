"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 健康チェックルーター
 *
 * @ignore
 */
const express = require("express");
const router = express.Router();
const createDebug = require("debug");
const httpStatus = require("http-status");
const mongoose = require("mongoose");
const mongooseConnectionOptions_1 = require("../../mongooseConnectionOptions");
const debug = createDebug('sskts-api:router:health');
const MONGOOSE_CONNECTION_READY_STATE_CONNECTED = 1;
router.get('', (_, res, next) => {
    debug('mongoose.connection.readyState is', mongoose.connection.readyState);
    // mongodb接続状態チェック
    if (mongoose.connection.readyState !== MONGOOSE_CONNECTION_READY_STATE_CONNECTED) {
        debug('connecting mongodb...');
        mongoose.connect(process.env.MONGOLAB_URI, mongooseConnectionOptions_1.default, (err) => {
            if (err) {
                return next(err);
            }
            res.status(httpStatus.OK).send('healthy!');
        });
    }
    else {
        res.status(httpStatus.OK).send('healthy!');
    }
});
exports.default = router;
