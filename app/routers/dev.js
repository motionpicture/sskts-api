"use strict";
/**
 * devルーター
 *
 * @ignore
 */
Object.defineProperty(exports, "__esModule", { value: true });
const sskts = require("@motionpicture/sskts-domain");
const express = require("express");
const devRouter = express.Router();
const http_status_1 = require("http-status");
const mongooseConnectionOptions_1 = require("../../mongooseConnectionOptions");
const authentication_1 = require("../middlewares/authentication");
const permitScopes_1 = require("../middlewares/permitScopes");
devRouter.use(authentication_1.default);
devRouter.get('/500', () => {
    throw new Error('500 manually');
});
devRouter.get('/environmentVariables', permitScopes_1.default(['admin']), (__, res) => {
    res.json({
        data: {
            type: 'envs',
            attributes: process.env
        }
    });
});
devRouter.get('/mongoose/connect', (__, res) => {
    sskts.mongoose.connect(process.env.MONGOLAB_URI, mongooseConnectionOptions_1.default, () => {
        res.status(http_status_1.NO_CONTENT).end();
    });
});
exports.default = devRouter;
