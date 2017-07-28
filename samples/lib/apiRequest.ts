/**
 * APIリクエストモジュール
 */

import * as request from 'request-promise-native';
// import * as parseString from 'string-template';

const API_ENDPOINT = <string>process.env.TEST_API_ENDPOINT;

export interface IOptions extends request.OptionsWithUri {
    method: string;
    expectedStatusCodes: number[];
}
/**
 * Create and send request to API
 */
function createAPIRequest(options: IOptions) {
    // Parse urls
    // if (options.url) {
    //     options.url = parseString(options.url, params);
    // }

    const expectedStatusCodes = options.expectedStatusCodes;
    delete options.expectedStatusCodes;

    const defaultOptions = {
        baseUrl: API_ENDPOINT,
        headers: {},
        qs: {},
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        useQuerystring: true
    };

    options = { ...defaultOptions, ...options };

    return request(options)
        .then((response) => {
            if (expectedStatusCodes.indexOf(response.statusCode) < 0) {
                // todo エラーパターン
                throw response.body;
            }

            if (response.body !== undefined && response.body.data !== undefined) {
                return response.body.data;
            }
        });
}

export default createAPIRequest;
