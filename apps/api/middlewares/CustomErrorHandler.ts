import {ErrorMiddlewareInterface, MiddlewareInterface, MiddlewareGlobalAfter} from "routing-controllers";
import {Request, Response, NextFunction} from "express";

@MiddlewareGlobalAfter()
export class CustomErrorHandler implements ErrorMiddlewareInterface {
    error(error: any, request: Request, response: Response, next: NextFunction) {
        console.error(error);
        response.json({
            success: false,
            message: error.message
        });
    }
}
