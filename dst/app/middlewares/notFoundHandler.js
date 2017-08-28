"use strict";
/**
 * 404ハンドラーミドルウェア
 *
 * @module middlewares/notFoundHandler
 */
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_1 = require("http-status");
exports.default = (req, res, next) => {
    res.status(http_status_1.NOT_FOUND);
    next(new Error(`router for [${req.originalUrl}] not found.`));
};
