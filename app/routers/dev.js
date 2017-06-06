"use strict";
/**
 * devルーター
 *
 * @ignore
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const devRouter = express.Router();
const http_status_1 = require("http-status");
const mongoose = require("mongoose");
const mongooseConnectionOptions_1 = require("../../mongooseConnectionOptions");
devRouter.get('/500', () => {
    throw new Error('500 manually');
});
devRouter.get('/environmentVariables', (__, res) => {
    res.json({
        data: {
            type: 'envs',
            attributes: process.env
        }
    });
});
devRouter.get('/mongoose/connect', (__, res) => {
    mongoose.connect(process.env.MONGOLAB_URI, mongooseConnectionOptions_1.default, () => {
        res.status(http_status_1.NO_CONTENT).end();
    });
});
exports.default = devRouter;
