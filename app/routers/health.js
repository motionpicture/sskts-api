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
const HTTPStatus = require("http-status");
const mongoose = require("mongoose");
const debug = createDebug('sskts-api:router:health');
const MONGOOSE_CONNECTION_READY_STATE_CONNECTED = 1;
router.get('', (_req, res, next) => {
    debug('mongoose.connection.readyState is', mongoose.connection.readyState);
    // mongodb接続状態チェック
    if (mongoose.connection.readyState !== MONGOOSE_CONNECTION_READY_STATE_CONNECTED) {
        debug('connecting mongodb...');
        mongoose.connect(process.env.MONGOLAB_URI, (err) => {
            if (err) {
                return next(err);
            }
            res.status(HTTPStatus.OK).send('healty');
        });
    }
    else {
        res.status(HTTPStatus.OK).send('healty');
    }
});
exports.default = router;
