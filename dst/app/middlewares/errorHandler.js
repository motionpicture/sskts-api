"use strict";
/**
 * エラーハンドラーミドルウェア
 *
 * todo errの内容、エラーオブジェクトタイプによって、本来はステータスコードを細かくコントロールするべき
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
        if (err instanceof Error && err.name === 'SSKTSError') {
            if (err.code === sskts.errorCode.ServiceUnavailable) {
                apiError = new api_1.APIError(http_status_1.SERVICE_UNAVAILABLE, [{
                        title: 'Service Unavailable',
                        detail: err.message
                    }]);
            }
            else {
                apiError = new api_1.APIError(http_status_1.BAD_REQUEST, [{
                        title: err.code,
                        detail: err.message
                    }]);
            }
        }
        else {
            apiError = new api_1.APIError(http_status_1.INTERNAL_SERVER_ERROR, [{
                    title: 'Internal Server Error',
                    detail: err.message
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
