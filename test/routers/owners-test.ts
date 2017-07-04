/**
 * 会員ルーターテスト
 *
 * @ignore
 */

import * as sskts from '@motionpicture/sskts-domain';
import * as assert from 'assert';
import * as httpStatus from 'http-status';
import * as supertest from 'supertest';
import * as util from 'util';

import * as app from '../../app/app';
import * as Resources from '../resources';
import * as OAuthScenario from './../scenarios/oauth';

const TEST_BODY_ADD_CARD = {
    data: {
        type: 'cards',
        attributes: {
            card_no: '4111111111111111',
            card_pass: '',
            expire: '2812',
            holder_name: 'AA BB'
        }
    }
};
let connection: sskts.mongoose.Connection;
before(async () => {
    connection = sskts.mongoose.createConnection(process.env.MONGOLAB_URI);
});

describe('会員プロフィール取得', () => {
    let memberOwner: Resources.IMemberOwner;
    beforeEach(async () => {
        // テスト会員作成
        memberOwner = await Resources.createMemberOwner();
    });
    afterEach(async () => {
        // テスト会員削除
        const ownerAdapter = sskts.adapter.owner(connection);
        await ownerAdapter.model.findByIdAndRemove(memberOwner.id).exec();
    });

    it('アクセストークン必須', async () => {
        await supertest(app)
            .get('/owners/me/profile')
            .set('Accept', 'application/json')
            .expect(httpStatus.UNAUTHORIZED);
    });

    it('会員ログイン必須', async () => {
        const accessToken = await OAuthScenario.loginAsAdmin();

        await supertest(app)
            .get('/owners/me/profile')
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .expect(httpStatus.FORBIDDEN);
    });

    it('会員としてログインすれば取得できる', async () => {
        const accessToken = await supertest(app)
            .post('/oauth/token')
            .send({
                grant_type: 'password',
                username: memberOwner.username,
                password: memberOwner.password,
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
                assert.equal(response.body.data.id, memberOwner.id);
            });
    });

    it('万が一会員情報が消えた場合NotFound', async () => {
        const accessToken = await supertest(app)
            .post('/oauth/token')
            .send({
                grant_type: 'password',
                username: memberOwner.username,
                password: memberOwner.password,
                scopes: ['owners.profile']
            })
            .then((response) => <string>response.body.access_token);

        // テスト会員を強制的に削除
        const ownerAdapter = sskts.adapter.owner(connection);
        await ownerAdapter.model.findByIdAndRemove(memberOwner.id).exec();

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
    let memberOwner: Resources.IMemberOwner;
    beforeEach(async () => {
        // テスト会員作成
        memberOwner = await Resources.createMemberOwner();
    });
    afterEach(async () => {
        // テスト会員削除
        const ownerAdapter = sskts.adapter.owner(connection);
        await ownerAdapter.model.findByIdAndRemove(memberOwner.id).exec();
    });

    it('更新できる', async () => {
        const accessToken = await OAuthScenario.loginAsMember(memberOwner.username, memberOwner.password, ['owners.profile']);

        const now = Date.now().toString();
        const email = util.format(
            '%s+%s@%s',
            (<string>process.env.SSKTS_DEVELOPER_EMAIL).split('@')[0],
            now,
            (<string>process.env.SSKTS_DEVELOPER_EMAIL).split('@')[1]
        );
        const body = {
            data: {
                type: 'owners',
                id: memberOwner.id,
                attributes: {
                    name_first: `first name${now}`,
                    name_last: `last name${now}`,
                    email: email,
                    tel: `090${now}`
                }
            }
        };

        await supertest(app)
            .put('/owners/me/profile')
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .send(body)
            .expect(httpStatus.NO_CONTENT);

        const ownerAdapter = sskts.adapter.owner(connection);
        const profileOption = await sskts.service.member.getProfile(memberOwner.id)(ownerAdapter);
        assert(profileOption.isDefined);
        const profile = profileOption.get();
        assert.equal(profile.name_first, body.data.attributes.name_first);
        assert.equal(profile.name_last, body.data.attributes.name_last);
        assert.equal(profile.email, body.data.attributes.email);
        assert.equal(profile.tel, body.data.attributes.tel);
    });
});

describe('カード取得', () => {
    let memberOwner: Resources.IMemberOwner;
    beforeEach(async () => {
        // テスト会員作成
        memberOwner = await Resources.createMemberOwner();
    });
    afterEach(async () => {
        // テスト会員削除
        const ownerAdapter = sskts.adapter.owner(connection);
        await ownerAdapter.model.findByIdAndRemove(memberOwner.id).exec();
    });

    it('取得できる', async () => {
        const accessToken = await OAuthScenario.loginAsMember(memberOwner.username, memberOwner.password, ['owners.cards']);

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
    let memberOwner: Resources.IMemberOwner;
    beforeEach(async () => {
        // テスト会員作成
        memberOwner = await Resources.createMemberOwner();
    });
    afterEach(async () => {
        // テスト会員削除
        const ownerAdapter = sskts.adapter.owner(connection);
        await ownerAdapter.model.findByIdAndRemove(memberOwner.id).exec();
    });

    it('生のカード情報で追加できる', async () => {
        const accessToken = await supertest(app)
            .post('/oauth/token')
            .send({
                grant_type: 'password',
                username: memberOwner.username,
                password: memberOwner.password,
                scopes: ['owners.cards']
            })
            .then((response) => <string>response.body.access_token);

        await supertest(app)
            .post('/owners/me/cards')
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .send(TEST_BODY_ADD_CARD)
            .expect(httpStatus.CREATED)
            .then((response) => {
                assert.equal(response.body.data.type, 'cards');
            });
    });
});

describe('カード削除', () => {
    let memberOwner: Resources.IMemberOwner;
    beforeEach(async () => {
        // テスト会員作成
        memberOwner = await Resources.createMemberOwner();
    });
    afterEach(async () => {
        // テスト会員削除
        const ownerAdapter = sskts.adapter.owner(connection);
        await ownerAdapter.model.findByIdAndRemove(memberOwner.id).exec();
    });

    it('追加後、削除できる', async () => {
        const accessToken = await supertest(app)
            .post('/oauth/token')
            .send({
                grant_type: 'password',
                username: memberOwner.username,
                password: memberOwner.password,
                scopes: ['owners.cards']
            })
            .then((response) => <string>response.body.access_token);

        // まず追加
        const addedCardId = await supertest(app)
            .post('/owners/me/cards')
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .send(TEST_BODY_ADD_CARD)
            .expect(httpStatus.CREATED)
            .then((response) => response.body.data.id);

        // 削除
        await supertest(app)
            .delete(`/owners/me/cards/${addedCardId}`)
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .expect(httpStatus.NO_CONTENT);
    });
});

describe('座席予約資産検索', () => {
    let memberOwner: Resources.IMemberOwner;
    beforeEach(async () => {
        // テスト会員作成
        memberOwner = await Resources.createMemberOwner();
    });
    afterEach(async () => {
        // テスト会員削除
        const ownerAdapter = sskts.adapter.owner(connection);
        await ownerAdapter.model.findByIdAndRemove(memberOwner.id).exec();
    });

    it('検索できる', async () => {
        const accessToken = await OAuthScenario.loginAsMember(memberOwner.username, memberOwner.password, ['owners.assets']);

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
