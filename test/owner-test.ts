/**
 * 会員ルーターテスト
 *
 * @ignore
 */

import * as sskts from '@motionpicture/sskts-domain';
import * as assert from 'assert';
import * as httpStatus from 'http-status';
import * as mongoose from 'mongoose';
import * as supertest from 'supertest';

import * as app from '../app/app';

let connection: mongoose.Connection;
before(async () => {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);

    // 会員全て削除
    const ownerAdapter = sskts.adapter.owner(connection);
    await ownerAdapter.model.remove({ group: sskts.factory.ownerGroup.MEMBER }).exec();
});

describe('会員プロフィール取得', () => {
    let TEST_OWNER_ID: string;
    let TEST_USERNAME: string;
    const TEST_PASSWORD: string = 'password';

    beforeEach(async () => {
        // テスト会員作成
        const ownerAdapter = sskts.adapter.owner(connection);
        TEST_USERNAME = `sskts-api:test:owner-test:${Date.now().toString()}`;
        const memberOwner = await sskts.factory.owner.member.create({
            username: TEST_USERNAME,
            password: TEST_PASSWORD,
            name_first: 'xxx',
            name_last: 'xxx',
            email: 'noreply@example.com'
        });
        await ownerAdapter.model.findByIdAndUpdate(memberOwner.id, memberOwner, { upsert: true }).exec();
        TEST_OWNER_ID = memberOwner.id;
    });

    afterEach(async () => {
        // テスト会員作成
        const ownerAdapter = sskts.adapter.owner(connection);
        await ownerAdapter.model.findByIdAndRemove(TEST_OWNER_ID).exec();
    });

    it('アクセストークン必須', async () => {
        await supertest(app)
            .get('/owners/me')
            .set('Accept', 'application/json')
            .expect(httpStatus.UNAUTHORIZED)
            .then((response) => {
                assert.equal(response.text, 'Unauthorized');
            });
    });

    it('会員ログイン必須', async () => {
        const accessToken = await supertest(app)
            .post('/oauth/token')
            .send({
                assertion: process.env.SSKTS_API_REFRESH_TOKEN,
                scope: 'admin'
            })
            .then((response) => <string>response.body.access_token);

        await supertest(app)
            .get('/owners/me')
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .expect(httpStatus.FORBIDDEN)
            .then((response) => {
                assert.equal(response.text, 'Forbidden');
            });
    });

    it('会員としてログインすれば取得できる', async () => {
        const accessToken = await supertest(app)
            .post('/oauth/token')
            .send({
                grant_type: 'password',
                username: TEST_USERNAME,
                password: TEST_PASSWORD,
                scopes: ['owners']
            })
            .then((response) => <string>response.body.access_token);

        await supertest(app)
            .get('/owners/me')
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.OK)
            .then((response) => {
                assert.equal(response.body.data.type, 'owners');
                assert.equal(response.body.data.id, TEST_OWNER_ID);
                assert.equal(response.body.data.attributes.username, TEST_USERNAME);
            });
    });

    it('万が一会員情報が消えた場合NotFound', async () => {
        const accessToken = await supertest(app)
            .post('/oauth/token')
            .send({
                grant_type: 'password',
                username: TEST_USERNAME,
                password: TEST_PASSWORD,
                scopes: ['owners']
            })
            .then((response) => <string>response.body.access_token);

        // テスト会員を強制的に削除
        const ownerAdapter = sskts.adapter.owner(connection);
        await ownerAdapter.model.findByIdAndRemove(TEST_OWNER_ID).exec();

        await supertest(app)
            .get('/owners/me')
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.NOT_FOUND)
            .then((response) => {
                assert.equal(response.body.data, null);
            });
    });
});
