/**
 * 会員必須ミドルウェアテスト
 * @ignore
 */

import * as assert from 'assert';

import * as requireMember from './requireMember';

let TEST_USER: any;
before(() => {
    TEST_USER = {
        sub: 'sub',
        username: 'username'
    };
});

describe('会員必須ミドルウェア 会員かどうか', () => {
    it('ユーザーネームが定義されているので会員', async () => {
        assert(requireMember.isMember(TEST_USER));
    });

    it('ユーザーネームが定義されていないので会員ではない', async () => {
        const user = { ...TEST_USER, ...{ username: undefined } };
        assert(!requireMember.isMember(user));
    });
});
