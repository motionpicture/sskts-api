"use strict";
/**
 * 健康チェックルーター
 *
 * @ignore
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const healthRouter = express.Router();
const createDebug = require("debug");
const http_status_1 = require("http-status");
const mongoose = require("mongoose");
const mongooseConnectionOptions_1 = require("../../mongooseConnectionOptions");
const redisClient = require("../../redisClient");
const debug = createDebug('sskts-api:healthRouter');
const MONGOOSE_CONNECTION_READY_STATE_CONNECTED = 1;
healthRouter.get('', (_, res, next) => __awaiter(this, void 0, void 0, function* () {
    debug('mongoose.connection.readyState:', mongoose.connection.readyState);
    debug('redisClient.connected:', redisClient.default.connected);
    try {
        yield Promise.all([
            new Promise((resolve, reject) => {
                // mongodb接続状態チェック
                if (mongoose.connection.readyState === MONGOOSE_CONNECTION_READY_STATE_CONNECTED) {
                    resolve();
                    return;
                }
                debug('connecting mongodb...');
                mongoose.connect(process.env.MONGOLAB_URI, mongooseConnectionOptions_1.default, (err) => {
                    if (err instanceof Error) {
                        reject(err);
                        return;
                    }
                    res.status(http_status_1.OK).send('healthy!');
                });
            }),
            new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                if (redisClient.default.connected) {
                    resolve();
                }
                else {
                    reject(new Error('redis unconnected'));
                }
            }))
        ]);
        res.status(http_status_1.OK).send('healthy!');
    }
    catch (error) {
        next(error);
    }
}));
exports.default = healthRouter;
