"use strict";
/**
 * error handler
 * エラーハンドラーミドルウェア
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
        if (err instanceof sskts.factory.errors.SSKTS) {
            switch (true) {
                // 401
                case (err instanceof sskts.factory.errors.Unauthorized):
                    apiError = new api_1.APIError(http_status_1.UNAUTHORIZED, [err]);
                    break;
                // 403
                case (err instanceof sskts.factory.errors.Forbidden):
                    apiError = new api_1.APIError(http_status_1.FORBIDDEN, [err]);
                    break;
                // 404
                case (err instanceof sskts.factory.errors.NotFound):
                    apiError = new api_1.APIError(http_status_1.NOT_FOUND, [err]);
                    break;
                // 409
                case (err instanceof sskts.factory.errors.AlreadyInUse):
                    apiError = new api_1.APIError(http_status_1.CONFLICT, [err]);
                    break;
                // 503
                case (err instanceof sskts.factory.errors.ServiceUnavailable):
                    apiError = new api_1.APIError(http_status_1.SERVICE_UNAVAILABLE, [err]);
                    break;
                // 400
                default:
                    apiError = new api_1.APIError(http_status_1.BAD_REQUEST, [err]);
                    break;
            }
        }
        else {
            // 500
            apiError = new api_1.APIError(http_status_1.INTERNAL_SERVER_ERROR, [new sskts.factory.errors.SSKTS('InternalServerError', err.message)]);
        }
    }
    res.status(apiError.code).json({
        error: apiError.toObject()
    });
};
