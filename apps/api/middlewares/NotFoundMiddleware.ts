import {MiddlewareGlobalAfter, MiddlewareInterface} from "routing-controllers";

@MiddlewareGlobalAfter()
export class NotFoundMiddleware implements MiddlewareInterface {
    use(request: any, response: any, next?: (err?: any) => any): any {
        if (!request.route) return next(new Error('Not Found'));
        next();
    }
}
