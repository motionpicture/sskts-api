/**
 * 会員必須ミドルウェアテスト
 *
 * @ignore
 */

import * as assert from 'assert';

import * as requireMember from '../../app/middlewares/requireMember';

const TEST_USER: Express.IUser = {
    owner: {
        id: 'xxx',
        username: 'username'
    },
    scopes: ['test']
};

describe('会員必須ミドルウェア 会員かどうか', () => {
    it('所有者が定義されているので会員', async () => {
        assert(requireMember.isMember(TEST_USER));
    });

    it('所有者が定義されていないので会員ではない', async () => {
        const user = { ...TEST_USER, ...{ owner: undefined } };
        assert(!requireMember.isMember(user));
    });
});
