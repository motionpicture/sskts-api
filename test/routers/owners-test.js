"use strict";
/**
 * 会員ルーターテスト
 *
 * @ignore
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const sskts = require("@motionpicture/sskts-domain");
const assert = require("assert");
const httpStatus = require("http-status");
const supertest = require("supertest");
const util = require("util");
const app = require("../../app/app");
const Resources = require("../resources");
const OAuthScenario = require("./../scenarios/oauth");
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
let connection;
before(() => __awaiter(this, void 0, void 0, function* () {
    connection = sskts.mongoose.createConnection(process.env.MONGOLAB_URI);
}));
describe('会員プロフィール取得', () => {
    let client;
    let memberOwner;
    beforeEach(() => __awaiter(this, void 0, void 0, function* () {
        // テスト会員作成
        client = yield Resources.createClient();
        memberOwner = yield Resources.createMemberOwner();
    }));
    afterEach(() => __awaiter(this, void 0, void 0, function* () {
        // テストクライアント削除
        const clientAdapter = sskts.adapter.client(connection);
        yield clientAdapter.clientModel.findByIdAndRemove(client.id).exec();
        // テスト会員削除
        const ownerAdapter = sskts.adapter.owner(connection);
        yield ownerAdapter.model.findByIdAndRemove(memberOwner.id).exec();
    }));
    it('アクセストークン必須', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .get('/owners/me/profile')
            .set('Accept', 'application/json')
            .expect(httpStatus.UNAUTHORIZED);
    }));
    it('会員ログイン必須', () => __awaiter(this, void 0, void 0, function* () {
        const accessToken = yield OAuthScenario.loginAsAdmin();
        yield supertest(app)
            .get('/owners/me/profile')
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .expect(httpStatus.FORBIDDEN);
    }));
    it('会員としてログインすれば取得できる', () => __awaiter(this, void 0, void 0, function* () {
        const accessToken = yield OAuthScenario.loginAsMember(client.id, 'test', memberOwner.username, memberOwner.password, ['owners.profile']);
        yield supertest(app)
            .get('/owners/me/profile')
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.OK)
            .then((response) => {
            assert.equal(response.body.data.type, 'owners');
            assert.equal(response.body.data.id, memberOwner.id);
        });
    }));
    it('万が一会員情報が消えた場合NotFound', () => __awaiter(this, void 0, void 0, function* () {
        const accessToken = yield OAuthScenario.loginAsMember(client.id, 'test', memberOwner.username, memberOwner.password, ['owners.profile']);
        // テスト会員を強制的に削除
        const ownerAdapter = sskts.adapter.owner(connection);
        yield ownerAdapter.model.findByIdAndRemove(memberOwner.id).exec();
        yield supertest(app)
            .get('/owners/me/profile')
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.NOT_FOUND)
            .then((response) => {
            assert.equal(response.body.data, null);
        });
    }));
});
describe('プロフィール更新', () => {
    let client;
    let memberOwner;
    beforeEach(() => __awaiter(this, void 0, void 0, function* () {
        // テスト会員作成
        client = yield Resources.createClient();
        memberOwner = yield Resources.createMemberOwner();
    }));
    afterEach(() => __awaiter(this, void 0, void 0, function* () {
        // テストクライアント削除
        const clientAdapter = sskts.adapter.client(connection);
        yield clientAdapter.clientModel.findByIdAndRemove(client.id).exec();
        // テスト会員削除
        const ownerAdapter = sskts.adapter.owner(connection);
        yield ownerAdapter.model.findByIdAndRemove(memberOwner.id).exec();
    }));
    it('更新できる', () => __awaiter(this, void 0, void 0, function* () {
        const accessToken = yield OAuthScenario.loginAsMember(client.id, 'test', memberOwner.username, memberOwner.password, ['owners.profile']);
        const now = Date.now().toString();
        const email = util.format('%s+%s@%s', process.env.SSKTS_DEVELOPER_EMAIL.split('@')[0], now, process.env.SSKTS_DEVELOPER_EMAIL.split('@')[1]);
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
        yield supertest(app)
            .put('/owners/me/profile')
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .send(body)
            .expect(httpStatus.NO_CONTENT);
        const ownerAdapter = sskts.adapter.owner(connection);
        const profileOption = yield sskts.service.member.getProfile(memberOwner.id)(ownerAdapter);
        assert(profileOption.isDefined);
        const profile = profileOption.get();
        assert.equal(profile.name_first, body.data.attributes.name_first);
        assert.equal(profile.name_last, body.data.attributes.name_last);
        assert.equal(profile.email, body.data.attributes.email);
        assert.equal(profile.tel, body.data.attributes.tel);
    }));
});
describe('カード取得', () => {
    let client;
    let memberOwner;
    beforeEach(() => __awaiter(this, void 0, void 0, function* () {
        // テスト会員作成
        client = yield Resources.createClient();
        memberOwner = yield Resources.createMemberOwner();
    }));
    afterEach(() => __awaiter(this, void 0, void 0, function* () {
        // テストクライアント削除
        const clientAdapter = sskts.adapter.client(connection);
        yield clientAdapter.clientModel.findByIdAndRemove(client.id).exec();
        // テスト会員削除
        const ownerAdapter = sskts.adapter.owner(connection);
        yield ownerAdapter.model.findByIdAndRemove(memberOwner.id).exec();
    }));
    it('取得できる', () => __awaiter(this, void 0, void 0, function* () {
        const accessToken = yield OAuthScenario.loginAsMember(client.id, 'test', memberOwner.username, memberOwner.password, ['owners.cards']);
        yield supertest(app)
            .get('/owners/me/cards')
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .expect(httpStatus.OK)
            .then((response) => {
            assert(Array.isArray(response.body.data));
        });
    }));
});
describe('カード追加', () => {
    let client;
    let memberOwner;
    beforeEach(() => __awaiter(this, void 0, void 0, function* () {
        // テスト会員作成
        client = yield Resources.createClient();
        memberOwner = yield Resources.createMemberOwner();
    }));
    afterEach(() => __awaiter(this, void 0, void 0, function* () {
        // テストクライアント削除
        const clientAdapter = sskts.adapter.client(connection);
        yield clientAdapter.clientModel.findByIdAndRemove(client.id).exec();
        // テスト会員削除
        const ownerAdapter = sskts.adapter.owner(connection);
        yield ownerAdapter.model.findByIdAndRemove(memberOwner.id).exec();
    }));
    it('生のカード情報で追加できる', () => __awaiter(this, void 0, void 0, function* () {
        const accessToken = yield OAuthScenario.loginAsMember(client.id, 'test', memberOwner.username, memberOwner.password, ['owners.cards']);
        yield supertest(app)
            .post('/owners/me/cards')
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .send(TEST_BODY_ADD_CARD)
            .expect(httpStatus.CREATED)
            .then((response) => {
            assert.equal(response.body.data.type, 'cards');
        });
    }));
});
describe('カード削除', () => {
    let client;
    let memberOwner;
    beforeEach(() => __awaiter(this, void 0, void 0, function* () {
        // テスト会員作成
        client = yield Resources.createClient();
        memberOwner = yield Resources.createMemberOwner();
    }));
    afterEach(() => __awaiter(this, void 0, void 0, function* () {
        // テストクライアント削除
        const clientAdapter = sskts.adapter.client(connection);
        yield clientAdapter.clientModel.findByIdAndRemove(client.id).exec();
        // テスト会員削除
        const ownerAdapter = sskts.adapter.owner(connection);
        yield ownerAdapter.model.findByIdAndRemove(memberOwner.id).exec();
    }));
    it('追加後、削除できる', () => __awaiter(this, void 0, void 0, function* () {
        const accessToken = yield OAuthScenario.loginAsMember(client.id, 'test', memberOwner.username, memberOwner.password, ['owners.cards']);
        // まず追加
        const addedCardId = yield supertest(app)
            .post('/owners/me/cards')
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .send(TEST_BODY_ADD_CARD)
            .expect(httpStatus.CREATED)
            .then((response) => response.body.data.id);
        // 削除
        yield supertest(app)
            .delete(`/owners/me/cards/${addedCardId}`)
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .expect(httpStatus.NO_CONTENT);
    }));
});
describe('座席予約資産検索', () => {
    let client;
    let memberOwner;
    beforeEach(() => __awaiter(this, void 0, void 0, function* () {
        // テスト会員作成
        client = yield Resources.createClient();
        memberOwner = yield Resources.createMemberOwner();
    }));
    afterEach(() => __awaiter(this, void 0, void 0, function* () {
        // テストクライアント削除
        const clientAdapter = sskts.adapter.client(connection);
        yield clientAdapter.clientModel.findByIdAndRemove(client.id).exec();
        // テスト会員削除
        const ownerAdapter = sskts.adapter.owner(connection);
        yield ownerAdapter.model.findByIdAndRemove(memberOwner.id).exec();
    }));
    it('検索できる', () => __awaiter(this, void 0, void 0, function* () {
        const accessToken = yield OAuthScenario.loginAsMember(client.id, 'test', memberOwner.username, memberOwner.password, ['owners.assets']);
        yield supertest(app)
            .get('/owners/me/assets/seatReservation')
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .expect(httpStatus.OK)
            .then((response) => {
            assert(Array.isArray(response.body.data));
        });
    }));
});
