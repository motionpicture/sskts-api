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
import * as util from 'util';

import * as app from '../app/app';
import * as OAuthScenario from './scenarios/oauth';

let connection: mongoose.Connection;
before(async () => {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
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
            email: process.env.SSKTS_DEVELOPER_EMAIL
        });
        await sskts.service.member.signUp(memberOwner)(ownerAdapter);
        TEST_OWNER_ID = memberOwner.id;
    });

    afterEach(async () => {
        // テスト会員削除
        const ownerAdapter = sskts.adapter.owner(connection);
        await ownerAdapter.model.findByIdAndRemove(TEST_OWNER_ID).exec();
    });

    it('アクセストークン必須', async () => {
        await supertest(app)
            .get('/owners/me/profile')
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
            .get('/owners/me/profile')
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
                scopes: ['owners.profile']
            })
            .then((response) => <string>response.body.access_token);

        await supertest(app)
            .get('/owners/me/profile')
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
                scopes: ['owners.profile']
            })
            .then((response) => <string>response.body.access_token);

        // テスト会員を強制的に削除
        const ownerAdapter = sskts.adapter.owner(connection);
        await ownerAdapter.model.findByIdAndRemove(TEST_OWNER_ID).exec();

        await supertest(app)
            .get('/owners/me/profile')
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.NOT_FOUND)
            .then((response) => {
                assert.equal(response.body.data, null);
            });
    });
});

describe('プロフィール更新', () => {
    it('更新できる', async () => {
        const accessToken = await OAuthScenario.loginAsMember(['owners.profile']);

        const now = Date.now().toString();
        const email = util.format(
            '%s+%s@%s',
            (<string>process.env.SSKTS_DEVELOPER_EMAIL).split('@')[0],
            now,
            (<string>process.env.SSKTS_DEVELOPER_EMAIL).split('@')[1]
        );
        const update = {
            name_first: `first name${now}`,
            name_last: `last name${now}`,
            email: email,
            tel: `090${now}`
        };
        await supertest(app)
            .put('/owners/me/profile')
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .send(update)
            .expect(httpStatus.NO_CONTENT)
            .then((response) => {
                assert.equal(response.text, '');
            });

        const ownerAdapter = sskts.adapter.owner(connection);
        const profileOption = await sskts.service.member.getProfile(OAuthScenario.TEST_OWNER_ID)(ownerAdapter);
        assert(profileOption.isDefined);
        const profile = profileOption.get();
        assert.equal(profile.name_first, update.name_first);
        assert.equal(profile.name_last, update.name_last);
        assert.equal(profile.email, update.email);
        assert.equal(profile.tel, update.tel);
    });
});

describe('カード取得', () => {
    it('取得できる', async () => {
        const accessToken = await OAuthScenario.loginAsMember(['owners.cards']);

        await supertest(app)
            .get('/owners/me/cards')
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .expect(httpStatus.OK)
            .then((response) => {
                assert(Array.isArray(response.body.data));
            });
    });
});

describe('カード追加', () => {
    it('生のカード情報で追加できる', async () => {
        const accessToken = await OAuthScenario.loginAsMember(['owners.cards']);

        await supertest(app)
            .post('/owners/me/cards')
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .send({
                card_no: '4111111111111111',
                card_pass: '111',
                expire: '2212',
                holder_name: 'AA BB'
            })
            .expect(httpStatus.CREATED)
            .then((response) => {
                assert.equal(response.body.data.type, 'cards');
            });
    });
});

describe('カード削除', () => {
    it('追加後、削除できる', async () => {
        const accessToken = await OAuthScenario.loginAsMember(['owners.cards']);

        // まず追加
        await supertest(app)
            .post('/owners/me/cards')
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .send({
                card_no: '4111111111111111',
                card_pass: '111',
                expire: '2212',
                holder_name: 'AA BB'
            })
            .expect(httpStatus.CREATED)
            .then((response) => {
                assert.equal(response.body.data.type, 'cards');
            });

        // 検索
        const cards = await supertest(app)
            .get('/owners/me/cards')
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .expect(httpStatus.OK)
            .then((response) => {
                return response.body.data;
            });

        // 削除
        const cardSeq = cards[0].attributes.card_seq;
        await supertest(app)
            .delete('/owners/me/cards')
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .send({
                card_seq: cardSeq
            })
            .expect(httpStatus.NO_CONTENT);

    });
});

describe('座席予約資産検索', () => {
    it('検索できる', async () => {
        const accessToken = await OAuthScenario.loginAsMember(['owners.assets']);

        await supertest(app)
            .get('/owners/me/assets/seatReservation')
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .expect(httpStatus.OK)
            .then((response) => {
                assert(Array.isArray(response.body.data));
            });
    });
});
