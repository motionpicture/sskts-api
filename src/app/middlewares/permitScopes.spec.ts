/**
 * スコープ許可ミドルウェアテスト
 * @ignore
 */

import * as assert from 'assert';
import * as sinon from 'sinon';

import * as permitScopes from './permitScopes';

let sandbox: sinon.SinonSandbox;

describe('permitScopes.default()', () => {
    let resourceServerIdentifier = process.env.RESOURECE_SERVER_IDENTIFIER;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
        resourceServerIdentifier = process.env.RESOURECE_SERVER_IDENTIFIER;
    });

    afterEach(() => {
        sandbox.restore();
        process.env.RESOURECE_SERVER_IDENTIFIER = resourceServerIdentifier;
    });

    it('RESOURECE_SERVER_IDENTIFIERが未定義であればエラーパラメーターと共にnextが呼ばれるはず', async () => {
        delete process.env.RESOURECE_SERVER_IDENTIFIER;
        const scopes = ['scope'];
        const params = {
            req: { user: { scopes: [] } },
            res: {},
            next: (__?: any) => undefined
        };

        sandbox.mock(params).expects('next').once()
            .withExactArgs(sinon.match.instanceOf(Error));

        const result = await permitScopes.default(scopes)(<any>params.req, <any>params.res, params.next);
        assert.equal(result, undefined);
        sandbox.verify();
    });

    it('スコープが十分であればエラーなしでnextが呼ばれるはず', async () => {
        const scopes = ['scope'];
        const params = {
            req: { user: { scopes: scopes.map((scope) => `${process.env.RESOURECE_SERVER_IDENTIFIER}/${scope}`) } },
            res: {},
            next: (__?: any) => undefined
        };

        sandbox.mock(params).expects('next').once()
            .withExactArgs();

        const result = await permitScopes.default(scopes)(<any>params.req, <any>params.res, params.next);
        assert.equal(result, undefined);
        sandbox.verify();
    });

    it('スコープ不足であればエラーパラメーターと共にnextが呼ばれるはず', async () => {
        const scopes = ['scope'];
        const params = {
            req: { user: { scopes: [] } },
            res: {},
            next: (__?: any) => undefined
        };

        sandbox.mock(params).expects('next').once()
            .withExactArgs(sinon.match.instanceOf(Error));

        const result = await permitScopes.default(scopes)(<any>params.req, <any>params.res, params.next);
        assert.equal(result, undefined);
        sandbox.verify();
    });

    it('isScopesPermittedがエラーを投げればエラーパラメーターと共にnextが呼ばれるはず', async () => {
        const scopes = ['scope'];
        const params = {
            req: { user: { scopes: '' } },
            res: {},
            next: (__?: any) => undefined
        };

        sandbox.mock(params).expects('next').once()
            .withExactArgs(sinon.match.instanceOf(Error));

        const result = await permitScopes.default(scopes)(<any>params.req, <any>params.res, params.next);
        assert.equal(result, undefined);
        sandbox.verify();
    });
});

describe('所有スコープが許可されたスコープかどうか', () => {
    it('許可される', async () => {
        const ownedScopes = ['owned1', 'owned2'];
        const permittedScopes = ['permitted1', 'permitted2', 'owned1'];

        const permitted = permitScopes.isScopesPermitted(ownedScopes, permittedScopes);
        assert(permitted);
    });

    it('許可されない', async () => {
        const ownedScopes = ['owned1', 'owned2'];
        const permittedScopes = ['permitted1', 'permitted2'];

        const permitted = permitScopes.isScopesPermitted(ownedScopes, permittedScopes);
        assert(!permitted);
    });

    it('所有スコープリストが配列でないと例外', async () => {
        const ownedScopes = 'owned1';
        const permittedScopes = ['permitted1', 'permitted2'];

        assert.throws(() => {
            permitScopes.isScopesPermitted(<any>ownedScopes, permittedScopes);
        });
    });
});
