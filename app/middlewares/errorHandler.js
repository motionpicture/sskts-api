"use strict";
/**
 * エラーハンドラーミドルウェア
 *
 * todo errの内容、エラーオブジェクトタイプによって、本来はステータスコードを細かくコントロールするべき
 * 現時点では、雑にコントロールしてある
 * @module middlewares/errorHandler
 */
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_1 = require("http-status");
const logger_1 = require("../logger");
exports.default = (err, __, res, next) => {
    logger_1.default.error('sskts-api:middleware:errorHandler', err);
    if (res.headersSent) {
        next(err);
        return;
    }
    // エラーオブジェクトの場合は、キャッチされた例外でクライント依存のエラーの可能性が高い
    if (err instanceof Error) {
        // oauth認証失敗
        if (err.name === 'UnauthorizedError') {
            res.status(http_status_1.UNAUTHORIZED).end('Unauthorized');
        }
        else {
            res.status(http_status_1.BAD_REQUEST).json({
                errors: [
                    {
                        title: err.name,
                        detail: err.message
                    }
                ]
            });
        }
    }
    else {
        res.status(http_status_1.INTERNAL_SERVER_ERROR).json({
            errors: [
                {
                    title: 'internal server error',
                    detail: 'an unexpected error occurred.'
                }
            ]
        });
    }
};
