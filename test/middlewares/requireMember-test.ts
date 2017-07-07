/**
 * 会員必須ミドルウェアテスト
 *
 * @ignore
 */

import * as sskts from '@motionpicture/sskts-domain';
import * as assert from 'assert';

import * as requireMember from '../../app/middlewares/requireMember';

let TEST_USER: Express.IUser;
before(() => {
    TEST_USER = sskts.factory.clientUser.create({
        client: 'xxx',
        state: 'xxx',
        owner: 'xxx',
        scopes: ['test']
    });
});

describe('会員必須ミドルウェア 会員かどうか', () => {
    it('所有者が定義されているので会員', async () => {
        assert(requireMember.isMember(TEST_USER));
    });

    it('所有者が定義されていないので会員ではない', async () => {
        const user = { ...TEST_USER, ...{ owner: undefined } };
        assert(!requireMember.isMember(user));
    });
});
