"use strict";
/**
 * 会員必須ミドルウェア
 *
 * @module middlewares/requireMember
 */
Object.defineProperty(exports, "__esModule", { value: true });
const sskts = require("@motionpicture/sskts-domain");
const createDebug = require("debug");
const debug = createDebug('sskts-api:middlewares:requireMember');
exports.default = (req, __, next) => {
    // 会員としてログイン済みであればOK
    if (isMember(req.getUser())) {
        debug('logged in as', req.getUser().sub);
        next();
        return;
    }
    next(new sskts.factory.error.Forbidden('login required'));
};
function isMember(user) {
    return (user.username !== undefined);
}
exports.isMember = isMember;
