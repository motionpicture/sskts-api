/**
 * 認証ミドルウェアテスト
 * @ignore
 */

import * as sskts from '@motionpicture/sskts-domain';
import * as assert from 'assert';
import { OK } from 'http-status';
import * as jwt from 'jsonwebtoken';
import * as nock from 'nock';
import * as sinon from 'sinon';

import * as authentication from './authentication';

let scope: nock.Scope;
let sandbox: sinon.SinonSandbox;
const jwks = {
    keys: [
        {
            alg: 'RS256',
            e: 'AQAB',
            kid: 'kid',
            kty: 'RSA',
            n: '12345',
            use: 'sig'
        }
    ]
};
const URI_JWKS = '/.well-known/jwks.json';
let openidConfiguration = {
    jwks_uri: ''
};

before(() => {
    openidConfiguration = {
        jwks_uri: `${process.env.TOKEN_ISSUER}${URI_JWKS}`
    };
});

describe('authentication.default()', () => {
    let tokenIssuer: string;

    beforeEach(() => {
        nock.cleanAll();
        nock.disableNetConnect();
        sandbox = sinon.sandbox.create();
        tokenIssuer = <string>process.env.TOKEN_ISSUER;
    });

    afterEach(() => {
        nock.cleanAll();
        nock.enableNetConnect();
        sandbox.restore();
        process.env.TOKEN_ISSUER = tokenIssuer;
    });

    it('bearerヘッダーがなければSSKTSErrorと共にnextが呼ばれるはず', async () => {
        const params = {
            req: { headers: {} },
            res: {},
            next: () => undefined
        };

        sandbox.mock(params).expects('next').once().withExactArgs(sinon.match.instanceOf(sskts.factory.errors.Unauthorized));

        const result = await authentication.default(<any>params.req, <any>params.res, params.next);
        assert.equal(result, undefined);
        sandbox.verify();
    });

    it('トークンをデコードできなければSSKTSErrorと共にnextが呼ばれるはず', async () => {
        const params = {
            req: { headers: { authorization: 'Bearer JWT' } },
            res: {},
            next: () => undefined
        };

        scope = nock(`${process.env.TOKEN_ISSUER}`);
        scope.get(authentication.URI_OPENID_CONFIGURATION).once().reply(OK, openidConfiguration);
        scope.get(URI_JWKS).once().reply(OK, jwks);

        sandbox.mock(jwt).expects('decode').once().returns(false);
        sandbox.mock(params).expects('next').once().withExactArgs(sinon.match.instanceOf(sskts.factory.errors.Unauthorized));

        const result = await authentication.default(<any>params.req, <any>params.res, params.next);
        assert.equal(result, undefined);
        assert(scope.isDone);
        sandbox.verify();
    });

    it('authorizationヘッダーが正しければnextが呼ばれるはず', async () => {
        const decodedJWT = {
            header: { kid: jwks.keys[0].kid },
            payload: { token_use: 'access', scope: 'scope scope2' }
        };
        const params: any = {
            req: { headers: { authorization: 'Bearer JWT' } },
            res: {},
            next: () => undefined
        };

        scope = nock(`${process.env.TOKEN_ISSUER}`);
        scope.get(authentication.URI_OPENID_CONFIGURATION).once().reply(OK, openidConfiguration);
        scope.get(URI_JWKS).once().reply(OK, jwks);

        sandbox.mock(jwt).expects('decode').once().returns(decodedJWT);
        // tslint:disable-next-line:no-magic-numbers
        sandbox.mock(jwt).expects('verify').once().callsArgWith(3, null, decodedJWT.payload);
        sandbox.mock(params).expects('next').once().withExactArgs();

        const result = await authentication.default(<any>params.req, <any>params.res, params.next);
        assert.equal(result, undefined);
        assert(scope.isDone);
        sandbox.verify();
    });

    it('もしscopeがpayloadに含まれなくてもスコープリストは初期化されるはず', async () => {
        const decodedJWT = {
            header: { kid: jwks.keys[0].kid },
            payload: { token_use: 'access' }
        };
        const params: any = {
            req: { headers: { authorization: 'Bearer JWT' } },
            res: {},
            next: () => undefined
        };

        scope = nock(`${process.env.TOKEN_ISSUER}`);
        scope.get(authentication.URI_OPENID_CONFIGURATION).once().reply(OK, openidConfiguration);
        scope.get(URI_JWKS).once().reply(OK, jwks);

        sandbox.mock(jwt).expects('decode').once().returns(decodedJWT);
        // tslint:disable-next-line:no-magic-numbers
        sandbox.mock(jwt).expects('verify').once().callsArgWith(3, null, decodedJWT.payload);
        sandbox.mock(params).expects('next').once().withExactArgs();

        const result = await authentication.default(<any>params.req, <any>params.res, params.next);
        assert.equal(result, undefined);
        assert(Array.isArray(params.req.user.scopes)); // scopesが配列として初期化されているはず
        assert(scope.isDone);
        sandbox.verify();
    });

    it('token_useがaccessでなければSSKTSErrorと共にnextが呼ばれるはず', async () => {
        const decodedJWT = {
            header: { kid: jwks.keys[0].kid },
            payload: { token_use: 'invalid', scope: '' }
        };
        const params = {
            req: { headers: { authorization: 'Bearer JWT' } },
            res: {},
            next: () => undefined
        };

        scope = nock(`${process.env.TOKEN_ISSUER}`);
        scope.get(authentication.URI_OPENID_CONFIGURATION).once().reply(OK, openidConfiguration);
        scope.get(URI_JWKS).once().reply(OK, jwks);

        sandbox.mock(jwt).expects('decode').once().returns(decodedJWT);
        sandbox.mock(jwt).expects('verify').never();
        sandbox.mock(params).expects('next').once().withExactArgs(sinon.match.instanceOf(sskts.factory.errors.Unauthorized));

        const result = await authentication.default(<any>params.req, <any>params.res, params.next);
        assert.equal(result, undefined);
        assert(scope.isDone);
        sandbox.verify();
    });

    it('公開鍵が存在しなければSSKTSErrorと共にnextが呼ばれるはず', async () => {
        const decodedJWT = {
            header: { kid: 'invalid' },
            payload: { token_use: 'access', scope: '' }
        };

        const params = {
            req: { headers: { authorization: 'Bearer JWT' } },
            res: {},
            next: () => undefined
        };

        scope = nock(`${process.env.TOKEN_ISSUER}`);
        scope.get(authentication.URI_OPENID_CONFIGURATION).once().reply(OK, openidConfiguration);
        scope.get(URI_JWKS).once().reply(OK, jwks);

        sandbox.mock(jwt).expects('decode').once().returns(decodedJWT);
        sandbox.mock(jwt).expects('verify').never();
        sandbox.mock(params).expects('next').once().withExactArgs(sinon.match.instanceOf(sskts.factory.errors.Unauthorized));

        const result = await authentication.default(<any>params.req, <any>params.res, params.next);
        assert.equal(result, undefined);
        assert(scope.isDone);
        sandbox.verify();
    });

    it('トークンのvefiryに失敗すればSSKTSErrorと共にnextが呼ばれるはず', async () => {
        const decodedJWT = {
            header: { kid: jwks.keys[0].kid },
            payload: { token_use: 'access', scope: '' }
        };

        const params = {
            req: { headers: { authorization: 'Bearer JWT' } },
            res: {},
            next: () => undefined
        };

        scope = nock(`${process.env.TOKEN_ISSUER}`);
        scope.get(authentication.URI_OPENID_CONFIGURATION).once().reply(OK, openidConfiguration);
        scope.get(URI_JWKS).once().reply(OK, jwks);

        sandbox.mock(jwt).expects('decode').once().returns(decodedJWT);
        // tslint:disable-next-line:no-magic-numbers
        sandbox.mock(jwt).expects('verify').once().callsArgWith(3, new Error('verify error'));
        sandbox.mock(params).expects('next').once().withExactArgs(sinon.match.instanceOf(sskts.factory.errors.Unauthorized));

        const result = await authentication.default(<any>params.req, <any>params.res, params.next);
        assert.equal(result, undefined);
        assert(scope.isDone);
        sandbox.verify();
    });
});
