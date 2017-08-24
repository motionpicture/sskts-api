"use strict";
/**
 * 会員必須ミドルウェア
 *
 * @module middlewares/requireMember
 */
Object.defineProperty(exports, "__esModule", { value: true });
const createDebug = require("debug");
const http_status_1 = require("http-status");
const debug = createDebug('sskts-api:middlewares:requireMember');
exports.default = (req, res, next) => {
    // 会員としてログイン済みであればOK
    if (isMember(req.getUser())) {
        debug('logged in as', req.getUser().sub);
        next();
        return;
    }
    res.status(http_status_1.FORBIDDEN).end('Forbidden');
};
function isMember(user) {
    return (user.username !== undefined);
}
exports.isMember = isMember;
