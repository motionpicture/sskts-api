import {Request, Response, NextFunction} from "express";
import {MiddlewareGlobalBefore, MiddlewareInterface} from "routing-controllers";
import Log4js = require('log4js');

@MiddlewareGlobalBefore()
export class BenchmarksMiddleware implements MiddlewareInterface {
    use(request: any, response: any, next?: (err?: any) => any): any {
        if (process.env.NODE_ENV === 'dev') {
            let startMemory = process.memoryUsage();
            let startTime = process.hrtime();
            let log4js: typeof Log4js = require('log4js');
            let logger = log4js.getLogger('system');

            request.on('end', () => {
                let endMemory = process.memoryUsage();
                let memoryUsage = endMemory.rss - startMemory.rss;
                let diff = process.hrtime(startTime);
                logger.debug(
                    `benchmark took ${diff[0]} seconds and ${diff[1]} nanoseconds. memoryUsage:${memoryUsage} (${startMemory.rss} - ${endMemory.rss})`
                );
            });
        }

        next();
    }
}
