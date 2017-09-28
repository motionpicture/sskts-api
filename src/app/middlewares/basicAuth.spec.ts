/**
 * ベーシック認証ミドルウェアテスト
 * @ignore
 */

import * as assert from 'assert';
import { UNAUTHORIZED } from 'http-status';
import * as nock from 'nock';
import * as sinon from 'sinon';

// import { APIError } from '../error/api';
import * as basicAuthMiddleware from './basicAuth';

// let scope: nock.Scope;
let sandbox: sinon.SinonSandbox;

describe('basicAuthMiddleware.default()', () => {
    beforeEach(() => {
        nock.cleanAll();
        nock.disableNetConnect();
        sandbox = sinon.sandbox.create();
        delete process.env.SSKTS_API_BASIC_AUTH_NAME;
        delete process.env.SSKTS_API_BASIC_AUTH_PASS;
    });

    afterEach(() => {
        nock.cleanAll();
        nock.enableNetConnect();
        sandbox.restore();
        delete process.env.SSKTS_API_BASIC_AUTH_NAME;
        delete process.env.SSKTS_API_BASIC_AUTH_PASS;
    });

    it('ユーザーネームとパスワードが正しければnextが呼ばれるはず', async () => {
        const username = 'username';
        const password = 'password';

        const authorization = `Basic ${new Buffer(`${username}:${password}`, 'utf8').toString('base64')}`;
        const params = {
            req: { headers: { authorization: authorization } },
            res: {},
            next: (__?: any) => undefined
        };

        process.env.SSKTS_API_BASIC_AUTH_NAME = username;
        process.env.SSKTS_API_BASIC_AUTH_PASS = password;

        sandbox.mock(params).expects('next').once().withExactArgs();

        const result = await basicAuthMiddleware.default(<any>params.req, <any>params.res, params.next);
        assert.equal(result, undefined);
        sandbox.verify();
    });

    it('ユーザーネームが間違っていれば401でレスポンスが返るはず', async () => {
        const username = 'username';
        const password = 'password';

        const authorization = `Basic ${new Buffer(`${username}:${password}`, 'utf8').toString('base64')}`;
        const params = {
            req: { headers: { authorization: authorization } },
            res: {
                setHeader: () => undefined,
                status: () => undefined,
                end: () => undefined
            },
            next: (__?: any) => undefined
        };

        process.env.SSKTS_API_BASIC_AUTH_NAME = username;
        process.env.SSKTS_API_BASIC_AUTH_PASS = 'invalid';

        sandbox.mock(params).expects('next').never();
        sandbox.mock(params.res).expects('status').once().withExactArgs(UNAUTHORIZED).returns(params.res);
        sandbox.mock(params.res).expects('end').once();

        const result = await basicAuthMiddleware.default(<any>params.req, <any>params.res, params.next);
        assert.equal(result, undefined);
        sandbox.verify();
    });

    it('ベーシック認証設定なしであればnextが呼ばれるはず', async () => {
        const params = {
            req: {},
            res: {},
            next: (__?: any) => undefined
        };

        sandbox.mock(params).expects('next').once().withExactArgs();

        const result = await basicAuthMiddleware.default(<any>params.req, <any>params.res, params.next);
        assert.equal(result, undefined);
        sandbox.verify();
    });
});
