"use strict";
/**
 * devルーター
 *
 * @ignore
 */
const express = require("express");
const router = express.Router();
const createDebug = require("debug");
const HTTPStatus = require("http-status");
const mongoose = require("mongoose");
const debug = createDebug('sskts-api:*');
// middleware that is specific to this router
// router.use((req, res, next) => {
//   debug('Time: ', Date.now())
//   next()
// })
router.get('/environmentVariables', (req, res) => {
    debug('ip:', req.ip);
    // this.logger.debug('process.env:', process.env);
    res.json({
        data: {
            type: 'envs',
            attributes: process.env
        }
    });
});
router.get('/mongoose/connect', (req, res, next) => {
    debug('ip:', req.ip);
    mongoose.connect(process.env.MONGOLAB_URI, (err) => {
        if (err) {
            return next(err);
        }
        res.status(HTTPStatus.NO_CONTENT).end();
    });
});
router.get('/mongoose/disconnect', (req, res, next) => {
    debug('ip:', req.ip);
    mongoose.disconnect((err) => {
        if (err) {
            return next(err);
        }
        res.status(HTTPStatus.NO_CONTENT).end();
    });
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = router;
