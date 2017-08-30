"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * APIError
 *
 * @class APIError
 * @extends {Error}
 */
class APIError extends Error {
    constructor(code, errors) {
        const message = errors.map((error) => error.message).join('\n');
        super(message);
        this.name = 'APIError';
        this.code = code;
        this.errors = errors;
        // Set the prototype explicitly.
        Object.setPrototypeOf(this, APIError.prototype);
    }
}
exports.APIError = APIError;
