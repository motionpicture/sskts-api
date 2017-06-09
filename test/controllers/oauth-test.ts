/**
 * oauthコントローラーテスト
 *
 * @ignore
 */

import * as assert from 'assert';

import * as oauthController from '../../app/controllers/oauth';

describe('oauthコントローラー 主張から資格情報を発行する', () => {
    it('主張が不適切なので発行できない', async () => {
        let issueError: any;
        try {
            await oauthController.issueCredentialsByAssertion('invalidassertion', ['admin']);
        } catch (error) {
            issueError = error;
        }

        assert(issueError instanceof Error);
    });

    it('発行できる', async () => {
        const credentials = await oauthController.issueCredentialsByAssertion(process.env.SSKTS_API_REFRESH_TOKEN, ['admin']);

        assert.equal(typeof credentials.access_token, 'string');
        assert.equal(typeof credentials.expires_in, 'number');
    });
});

describe('oauthコントローラー 任意のデータをJWTを使用して資格情報へ変換する', () => {
    it('変換できる', async () => {
        const credentials = await oauthController.payload2credentials({});

        assert.equal(typeof credentials.access_token, 'string');
        assert.equal(typeof credentials.expires_in, 'number');
    });
});
