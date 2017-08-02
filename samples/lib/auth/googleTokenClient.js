"use strict";
/**
 * GooleサインインOAuthクライアント
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const createDebug = require("debug");
const httpStatus = require("http-status");
const request = require("request-promise-native");
const oAuth2client_1 = require("./oAuth2client");
const debug = createDebug('sskts-api:auth:oAuth2client');
class GoogleTokenClient extends oAuth2client_1.default {
    constructor(idToken, clientId, state, scopes) {
        super(clientId, '', state, scopes);
        this.idToken = idToken;
        this.credentials = { refresh_token: 'ignored' };
    }
    getToken() {
        return __awaiter(this, void 0, void 0, function* () {
            debug('requesting an access token...');
            return yield request.post({
                url: oAuth2client_1.default.SSKTS_OAUTH2_TOKEN_GOOGLE_URL,
                form: {
                    id_token: this.idToken,
                    client_id: this.clientId,
                    scope: this.scopes.join(' '),
                    state: this.state
                },
                json: true,
                simple: false,
                resolveWithFullResponse: true,
                useQuerystring: true
            }).then((response) => {
                if (response.statusCode !== httpStatus.OK) {
                    if (typeof response.body === 'string') {
                        throw new Error(response.body);
                    }
                    if (typeof response.body === 'object' && response.body.errors !== undefined) {
                        const message = response.body.errors.map((error) => {
                            return `[${error.title}]${error.detail}`;
                        }).join(', ');
                        throw new Error(message);
                    }
                    throw new Error('An unexpected error occurred');
                }
                const tokens = response.body;
                if (tokens && tokens.expires_in) {
                    // tslint:disable-next-line:no-magic-numbers
                    tokens.expiry_date = ((new Date()).getTime() + (tokens.expires_in * 1000));
                    delete tokens.expires_in;
                }
                tokens.refresh_token = 'ignored';
                return tokens;
            });
        });
    }
    /**
     * Refreshes the access token.
     */
    refreshToken(__) {
        return __awaiter(this, void 0, void 0, function* () {
            debug('refreshing an access token...');
            return this.getToken();
        });
    }
}
exports.default = GoogleTokenClient;
