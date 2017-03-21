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
 * oauthルーター
 *
 * @ignore
 */
const express = require("express");
const router = express.Router();
const createDebug = require("debug");
const jwt = require("jsonwebtoken");
const validator_1 = require("../middlewares/validator");
const debug = createDebug('sskts-api:*');
// todo どこで定義するか
const ACCESS_TOKEN_EXPIRES_IN_SECONDS = 1800;
router.post('/token', (req, _, next) => {
    req.checkBody('assertion', 'invalid assertion').notEmpty().withMessage('assertion is required')
        .equals(process.env.SSKTS_API_REFRESH_TOKEN);
    req.checkBody('scope', 'invalid scope').notEmpty().withMessage('scope is required')
        .equals('admin');
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        jwt.sign({
            scope: req.body.scope.toString()
        }, process.env.SSKTS_API_SECRET, {
            expiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS
        }, (err, encoded) => {
            debug(err, encoded);
            if (err instanceof Error) {
                throw err;
            }
            else {
                debug('encoded is', encoded);
                res.json({
                    access_token: encoded,
                    token_type: 'Bearer',
                    expires_in: ACCESS_TOKEN_EXPIRES_IN_SECONDS
                });
            }
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
