"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_1 = require("http-status");
exports.default = (err, _, res, next) => {
    console.error(err);
    if (res.headersSent) {
        next(err);
        return;
    }
    res.status(http_status_1.INTERNAL_SERVER_ERROR);
    res.json({
        errors: [
            {
                title: 'internal server error',
                detail: 'an unexpected error occurred.'
            }
        ]
    });
};
