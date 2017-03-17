"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * devルーター
 *
 * @ignore
 */
const express = require("express");
const router = express.Router();
const createDebug = require("debug");
const httpStatus = require("http-status");
const mongoose = require("mongoose");
const mongooseConnectionOptions_1 = require("../../mongooseConnectionOptions");
const debug = createDebug('sskts-api:*');
router.get('/500', () => {
    throw new Error('500 manually');
});
router.get('/environmentVariables', (req, res) => {
    debug('ip:', req.ip);
    res.json({
        data: {
            type: 'envs',
            attributes: process.env
        }
    });
});
router.get('/mongoose/connect', (req, res, next) => {
    debug('ip:', req.ip);
    mongoose.connect(process.env.MONGOLAB_URI, mongooseConnectionOptions_1.default, (err) => {
        if (err) {
            return next(err);
        }
        res.status(httpStatus.NO_CONTENT).end();
    });
});
router.get('/mongoose/disconnect', (req, res, next) => {
    debug('ip:', req.ip);
    mongoose.disconnect((err) => {
        if (err) {
            return next(err);
        }
        res.status(httpStatus.NO_CONTENT).end();
    });
});
exports.default = router;
