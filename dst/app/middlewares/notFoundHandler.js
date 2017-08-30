"use strict";
/**
 * 404ハンドラーミドルウェア
 *
 * @module middlewares/notFoundHandler
 */
Object.defineProperty(exports, "__esModule", { value: true });
const sskts = require("@motionpicture/sskts-domain");
exports.default = (req, __, next) => {
    next(new sskts.factory.error.NotFound(`router for [${req.originalUrl}]`));
};
