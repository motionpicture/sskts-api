/**
 * バリデーションミドルウェアテスト
 * @ignore
 */

import * as assert from 'assert';
import * as nock from 'nock';
import * as sinon from 'sinon';

import { APIError } from '../error/api';
import * as validatorMiddleware from './validator';

let sandbox: sinon.SinonSandbox;

describe('validatorMiddleware.default()', () => {
    beforeEach(() => {
        nock.cleanAll();
        nock.disableNetConnect();
        sandbox = sinon.sandbox.create();
    });

    afterEach(() => {
        nock.cleanAll();
        nock.enableNetConnect();
        sandbox.restore();
    });

    it('バリエーションエラーがなければnextが呼ばれるはず', async () => {
        const validatorResult = {
            isEmpty: () => undefined
        };
        const params = {
            req: {
                getValidationResult: () => validatorResult
            },
            res: {},
            next: () => undefined
        };

        sandbox.mock(validatorResult).expects('isEmpty').once().returns(true);
        sandbox.mock(params).expects('next').once().withExactArgs();

        const result = await validatorMiddleware.default(<any>params.req, <any>params.res, params.next);
        assert.equal(result, undefined);
        sandbox.verify();
    });

    it('バリエーションエラーがあればAPIErrorと共にnextが呼ばれるはず', async () => {
        const validatorResult = {
            isEmpty: () => undefined,
            array: () => [{ param: 'param', msg: 'msg' }]
        };
        const params = {
            req: {
                getValidationResult: () => validatorResult
            },
            res: {},
            next: () => undefined
        };

        sandbox.mock(validatorResult).expects('isEmpty').once().returns(false);
        sandbox.mock(params).expects('next').once().withExactArgs(sinon.match.instanceOf(APIError));

        const result = await validatorMiddleware.default(<any>params.req, <any>params.res, params.next);
        assert.equal(result, undefined);
        sandbox.verify();
    });
});
