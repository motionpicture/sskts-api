import {MiddlewareGlobalBefore, MiddlewareInterface} from "routing-controllers";
import requestModule = require("request");

@MiddlewareGlobalBefore()
export class COAOAuthMiddleware implements MiddlewareInterface {
    use(request: any, response: any, next?: (err?: any) => any): any {
        requestModule.post({
            url: "http://CoaCinema.aa0.netvolante.jp/token/access_token",
            form: {
                refresh_token: "eyJhbGciOiJIUzI1NiJ9.eyJjcmVhdGVkX2F0IjoxNDc5MjYwODQ4LCJhdXRoX2lkIjoiMzMxNSJ9.jx-w7D3YLP7UbY4mzJYC9xr368FiKWcpR2_L9mZfehQ"
            },
            json: true
        }, (error: any, response, body) => {
            request.access_token = body.access_token;
            next();
        });
    }
}
