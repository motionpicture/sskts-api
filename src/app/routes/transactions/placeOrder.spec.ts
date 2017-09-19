/**
 * transactions/placeOrder test
 * @ignore
 */

import * as sskts from '@motionpicture/sskts-domain';
import { CREATED } from 'http-status';
import * as assert from 'power-assert';
import * as sinon from 'sinon';
import * as supertest from 'supertest';
import * as authenticationMiddleware from '../../middlewares/authentication';
import * as permitScopesMiddleware from '../../middlewares/permitScopes';

let sandbox: sinon.SinonSandbox;

before(() => {
    sandbox = sinon.sandbox.create();
});

describe('PUT /transactions/placeOrder/:transactionId/customerContact', () => {
    afterEach(() => {
        sandbox.restore();
    });

    it('トークンが正しければ更新できるはず', async () => {
        const payload = { sub: 'sub' };
        const transactionId = 'transactionId';
        const contact = {
            familyName: 'familyName',
            givenName: 'givenName',
            email: 'email',
            telephone: '09012345678'
        };

        sandbox.mock(authenticationMiddleware).expects('default').once().callsFake(async (req: any, __: any, next: any) => {
            req.user = payload;
            next();
        });
        sandbox.mock(permitScopesMiddleware).expects('default').atLeast(1).returns((__1: any, __2: any, next: any) => {
            next();
        });
        sandbox.mock(sskts.service.transaction.placeOrderInProgress).expects('setCustomerContacts').once()
            .returns(async () => Promise.resolve());

        // tslint:disable-next-line:no-require-imports
        const result = await supertest(require('../../app'))
            .put(`/transactions/placeOrder/${transactionId}/customerContact`)
            .set('Accept', 'application/json')
            .send(contact)
            .expect(CREATED)
            .then((response) => response.body);

        assert.equal(typeof result, 'object');
        sandbox.verify();
    });
});
