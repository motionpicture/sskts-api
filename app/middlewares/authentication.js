"use strict";
/**
 * oauthミドルウェア
 *
 * @module middlewares/authentication
 */
Object.defineProperty(exports, "__esModule", { value: true });
const createDebug = require("debug");
const jwt = require("express-jwt");
const debug = createDebug('sskts-api:middlewares:authentication');
exports.default = [
    jwt({
        secret: process.env.SSKTS_API_SECRET
    }),
    (req, __, next) => {
        debug('req.user:', req.user);
        next();
    }
];
