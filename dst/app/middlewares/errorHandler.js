"use strict";
// tslint:disable-next-line:no-suspicious-comment
/**
 * エラーハンドラーミドルウェア
 *
 * TODO errの内容、エラーオブジェクトタイプによって、本来はステータスコードを細かくコントロールするべき
 * 現時点では、雑にコントロールしてある
 * @module middlewares/errorHandler
 */
Object.defineProperty(exports, "__esModule", { value: true });
const sskts = require("@motionpicture/sskts-domain");
const http_status_1 = require("http-status");
const api_1 = require("../error/api");
const logger_1 = require("../logger");
exports.default = (err, __, res, next) => {
    logger_1.default.error('sskts-api:middleware:errorHandler', err);
    if (res.headersSent) {
        next(err);
        return;
    }
    let apiError;
    if (err instanceof api_1.APIError) {
        apiError = err;
    }
    else {
        if (err instanceof sskts.factory.error.SSKTS) {
            switch (true) {
                case (err instanceof sskts.factory.error.ServiceUnavailable):
                    apiError = new api_1.APIError(http_status_1.SERVICE_UNAVAILABLE, [err]);
                    break;
                case (err instanceof sskts.factory.error.NotFound):
                    apiError = new api_1.APIError(http_status_1.NOT_FOUND, [err]);
                    break;
                default:
                    apiError = new api_1.APIError(http_status_1.BAD_REQUEST, [err]);
                    break;
            }
        }
        else {
            apiError = new api_1.APIError(http_status_1.INTERNAL_SERVER_ERROR, [{
                    reason: 'internalServerError',
                    message: err.message
                }]);
        }
    }
    res.status(apiError.code).json({
        error: {
            errors: apiError.errors,
            code: apiError.code,
            message: apiError.message
        }
    });
};
