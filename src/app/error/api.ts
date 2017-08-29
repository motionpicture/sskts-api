export interface IChildError {
    source?: { parameter: string; };
    title: string;
    detail: string;
}
/**
 * APIError
 *
 * @class APIError
 * @extends {Error}
 */
export class APIError extends Error {
    public readonly code: number;
    public readonly errors: IChildError[];

    constructor(code: number, errors: IChildError[]) {
        const message = errors.map((error) => error.detail).join('\n');
        super(message);

        this.name = 'APIError';
        this.code = code;
        this.errors = errors;

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, APIError.prototype);
    }
}
