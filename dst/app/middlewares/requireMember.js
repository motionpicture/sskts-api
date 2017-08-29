"use strict";
/**
 * 会員必須ミドルウェア
 *
 * @module middlewares/requireMember
 */
Object.defineProperty(exports, "__esModule", { value: true });
const createDebug = require("debug");
const http_status_1 = require("http-status");
const api_1 = require("../error/api");
const debug = createDebug('sskts-api:middlewares:requireMember');
exports.default = (req, __, next) => {
    // 会員としてログイン済みであればOK
    if (isMember(req.getUser())) {
        debug('logged in as', req.getUser().sub);
        next();
        return;
    }
    next(new api_1.APIError(http_status_1.FORBIDDEN, [{
            title: 'Forbidden',
            detail: 'login required'
        }]));
};
function isMember(user) {
    return (user.username !== undefined);
}
exports.isMember = isMember;
