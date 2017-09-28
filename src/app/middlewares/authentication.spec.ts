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
const openidConfiguration = {
    jwks_uri: 'https://example.com/.well-known/jwks.json'
};

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
            next: (__?: any) => undefined
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
            next: (__?: any) => undefined
        };
        scope = nock(`${process.env.TOKEN_ISSUER}`).get('/.well-known/openid-configuration')
            .reply(OK, openidConfiguration);
        const scope2 = nock('https://example.com').get('/.well-known/jwks.json')
            .reply(OK, jwks);

        sandbox.mock(jwt).expects('decode').once().returns(false);
        sandbox.mock(params).expects('next').once().withExactArgs(sinon.match.instanceOf(sskts.factory.errors.Unauthorized));

        const result = await authentication.default(<any>params.req, <any>params.res, params.next);
        assert.equal(result, undefined);
        assert(scope.isDone);
        assert(scope2.isDone);
        sandbox.verify();
    });

    it('authorizationヘッダーが正しければnextが呼ばれるはず', async () => {
        const decodedJWT = {
            header: { kid: 'kid' },
            payload: { token_use: 'access', scope: 'scope scope2' }
        };
        scope = nock(`${process.env.TOKEN_ISSUER}`).get('/.well-known/openid-configuration')
            .reply(OK, openidConfiguration);
        const scope2 = nock('https://example.com').get('/.well-known/jwks.json')
            .reply(OK, jwks);

        const params = {
            req: { headers: { authorization: 'Bearer JWT' } },
            res: {},
            next: (__?: any) => undefined
        };

        sandbox.mock(jwt).expects('decode').once().returns(decodedJWT);
        // tslint:disable-next-line:no-magic-numbers
        sandbox.mock(jwt).expects('verify').once().callsArgWith(3, null, decodedJWT);
        sandbox.mock(params).expects('next').once().withExactArgs();

        const result = await authentication.default(<any>params.req, <any>params.res, params.next);
        assert.equal(result, undefined);
        assert(scope.isDone);
        assert(scope2.isDone);
        sandbox.verify();
    });

    it('token_useがaccessでなければSSKTSErrorと共にnextが呼ばれるはず', async () => {
        const decodedJWT = {
            header: { kid: 'kid' },
            payload: { token_use: 'invalid', scope: 'scope scope' }
        };
        scope = nock(`${process.env.TOKEN_ISSUER}`).get('/.well-known/openid-configuration')
            .reply(OK, openidConfiguration);
        const scope2 = nock('https://example.com').get('/.well-known/jwks.json')
            .reply(OK, jwks);

        const params = {
            req: { headers: { authorization: 'Bearer JWT' } },
            res: {},
            next: (__?: any) => undefined
        };

        sandbox.mock(jwt).expects('decode').once().returns(decodedJWT);
        sandbox.mock(jwt).expects('verify').never();
        sandbox.mock(params).expects('next').once().withExactArgs(sinon.match.instanceOf(sskts.factory.errors.Unauthorized));

        const result = await authentication.default(<any>params.req, <any>params.res, params.next);
        assert.equal(result, undefined);
        assert(scope.isDone);
        assert(scope2.isDone);
        sandbox.verify();
    });

    it('公開鍵が存在しなければSSKTSErrorと共にnextが呼ばれるはず', async () => {
        const decodedJWT = {
            header: { kid: 'invalid' },
            payload: { token_use: 'access', scope: 'scope scope' }
        };
        scope = nock(`${process.env.TOKEN_ISSUER}`).get('/.well-known/openid-configuration')
            .reply(OK, openidConfiguration);
        const scope2 = nock('https://example.com').get('/.well-known/jwks.json')
            .reply(OK, jwks);

        const params = {
            req: { headers: { authorization: 'Bearer JWT' } },
            res: {},
            next: (__?: any) => undefined
        };

        sandbox.mock(jwt).expects('decode').once().returns(decodedJWT);
        sandbox.mock(jwt).expects('verify').never();
        sandbox.mock(params).expects('next').once().withExactArgs(sinon.match.instanceOf(sskts.factory.errors.Unauthorized));

        const result = await authentication.default(<any>params.req, <any>params.res, params.next);
        assert.equal(result, undefined);
        assert(scope.isDone);
        assert(scope2.isDone);
        sandbox.verify();
    });
});
