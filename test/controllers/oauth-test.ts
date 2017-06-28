/**
 * oauthコントローラーテスト
 *
 * @ignore
 */

import * as sskts from '@motionpicture/sskts-domain';
import * as assert from 'assert';
import * as mongoose from 'mongoose';

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

describe('oauthコントローラー クライアントIDから資格情報を発行する', () => {
    before(() => {
        mongoose.connect(process.env.MONGOLAB_URI);
    });

    it('クライアントが存在しないので発行できない', async () => {
        let issueError: any;
        try {
            await oauthController.issueCredentialsByClient('invalidclient', 'test', ['admin']);
        } catch (error) {
            issueError = error;
        }

        assert(issueError instanceof Error);
    });

    it('発行できる', async () => {
        // テストクライアント作成
        const client = sskts.factory.client.create({
            id: 'test',
            secret_hash: 'test',
            name: { en: '', ja: '' },
            description: { en: '', ja: '' },
            notes: { en: '', ja: '' },
            email: process.env.SSKTS_DEVELOPER_EMAIL
        });
        const clientAdapter = sskts.adapter.client(mongoose.connection);
        await clientAdapter.clientModel.findByIdAndUpdate(client.id, client, { new: true, upsert: true }).exec();

        const credentials = await oauthController.issueCredentialsByClient(client.id, 'test', ['admin']);

        assert.equal(typeof credentials.access_token, 'string');
        assert.equal(typeof credentials.expires_in, 'number');

        // テストクライアント削除
        await clientAdapter.clientModel.findByIdAndRemove(client.id).exec();
    });
});

describe('oauthコントローラー 任意のデータをJWTを使用して資格情報へ変換する', () => {
    it('変換できる', async () => {
        const credentials = await oauthController.payload2credentials({});

        assert.equal(typeof credentials.access_token, 'string');
        assert.equal(typeof credentials.expires_in, 'number');
    });
});
