/**
 * oauthルーターテスト
 *
 * @ignore
 */

import * as sskts from '@motionpicture/sskts-domain';
import * as assert from 'assert';
import * as httpStatus from 'http-status';
import * as jwt from 'jsonwebtoken';
import * as supertest from 'supertest';

import * as app from '../../app/app';
import * as Resources from '../resources';

let TEST_CLIENT_ID: string;
let TEST_USERNAME: string;
const TEST_PASSWORD = 'password';
let TEST_BODY_CLIENT_CREDENTIALS: any;
let TEST_BODY_PASSWORD: any;

let connection: sskts.mongoose.Connection;
before(async () => {
    connection = sskts.mongoose.createConnection(process.env.MONGOLAB_URI);

    TEST_CLIENT_ID = `sskts-api:test:oauth${Date.now().toString()}`;
    TEST_BODY_CLIENT_CREDENTIALS = {
        grant_type: 'client_credentials',
        scopes: ['test'],
        client_id: TEST_CLIENT_ID,
        state: 'test'
    };
    TEST_USERNAME = `sskts-api:test:oauth${Date.now().toString()}`;
    TEST_BODY_PASSWORD = {
        grant_type: 'password',
        scopes: ['test'],
        client_id: '',
        state: 'test',
        username: TEST_USERNAME,
        password: TEST_PASSWORD
    };
});

describe('認可タイプに共通の仕様', () => {
    it('非対応の認可タイプならBAD_REQUEST', async () => {
        await supertest(app)
            .post('/oauth/token')
            .send({
                grant_type: 'invalidgranttype',
                scopes: ['test']
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.BAD_REQUEST)
            .then((response) => {
                assert(Array.isArray(response.body.errors));
            });
    });
});

describe('POST /oauth/token', () => {
    it('found', async () => {
        await supertest(app)
            .post('/oauth/token')
            .send({
                assertion: process.env.SSKTS_API_REFRESH_TOKEN,
                scope: 'admin'
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.OK)
            .then((response) => {
                assert(typeof response.body.access_token === 'string');
                assert(typeof response.body.token_type === 'string');
                assert(Number.isInteger(response.body.expires_in));
            });
    });

    it('invalid assertion', async () => {
        await supertest(app)
            .post('/oauth/token')
            .send({
                assertion: 'assertion',
                scope: 'admin'
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.BAD_REQUEST)
            .then((response) => {
                assert(Array.isArray(response.body.errors));
            });
    });

    it('スコープがadminでなければBAD_REQUEST', async () => {
        await supertest(app)
            .post('/oauth/token')
            .send({
                assertion: process.env.SSKTS_API_REFRESH_TOKEN,
                scope: '*****'
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.BAD_REQUEST)
            .then((response) => {
                assert(Array.isArray(response.body.errors));
            });
    });
});

describe('クライアント情報認可', () => {
    it('スコープ不足ならBAD_REQUEST', async () => {
        const data = { ...TEST_BODY_CLIENT_CREDENTIALS, ...{ scopes: undefined } };
        await supertest(app)
            .post('/oauth/token')
            .send(data)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.BAD_REQUEST)
            .then((response) => {
                assert(Array.isArray(response.body.errors));
            });
    });

    it('クライアントID不足ならBAD_REQUEST', async () => {
        const data = { ...TEST_BODY_CLIENT_CREDENTIALS, ...{ client_id: undefined } };
        await supertest(app)
            .post('/oauth/token')
            .send(data)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.BAD_REQUEST)
            .then((response) => {
                assert(Array.isArray(response.body.errors));
            });
    });

    it('ステート不足ならBAD_REQUEST', async () => {
        const data = { ...TEST_BODY_CLIENT_CREDENTIALS, ...{ state: undefined } };
        await supertest(app)
            .post('/oauth/token')
            .send(data)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.BAD_REQUEST)
            .then((response) => {
                assert(Array.isArray(response.body.errors));
            });
    });

    it('クライアント存在しなければBAD_REQUEST', async () => {
        await supertest(app)
            .post('/oauth/token')
            .send(TEST_BODY_CLIENT_CREDENTIALS)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.BAD_REQUEST)
            .then((response) => {
                assert(Array.isArray(response.body.errors));
            });
    });

    it('資格情報取得成功', async () => {
        // テストクライアント作成
        const client = sskts.factory.client.create({
            id: TEST_CLIENT_ID,
            secret_hash: 'test',
            name: { en: '', ja: '' },
            description: { en: '', ja: '' },
            notes: { en: '', ja: '' },
            email: process.env.SSKTS_DEVELOPER_EMAIL
        });
        const clientAdapter = sskts.adapter.client(connection);
        await clientAdapter.clientModel.findByIdAndUpdate(client.id, client, { new: true, upsert: true }).exec();

        const credentials = await supertest(app)
            .post('/oauth/token')
            .send(TEST_BODY_CLIENT_CREDENTIALS)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.OK)
            .then((response) => response.body);

        assert(typeof credentials.access_token, 'string');
        assert(typeof credentials.token_type, 'string');
        assert(typeof credentials.expires_in, 'number');

        // アクセストークンに適切にデータが含まれているはず
        const payload = <Express.IUser>await new Promise<any>((resolve, reject) => {
            jwt.verify(credentials.access_token, <string>process.env.SSKTS_API_SECRET, {}, (err, decoded) => {
                if (err instanceof Error) {
                    reject(err);
                } else {
                    resolve(<any>decoded);
                }
            });
        });
        assert.equal(payload.client, TEST_BODY_CLIENT_CREDENTIALS.client_id);
        assert.equal(payload.state, TEST_BODY_CLIENT_CREDENTIALS.state);
        assert.deepEqual(payload.scopes, TEST_BODY_CLIENT_CREDENTIALS.scopes);

        // テストクライアント削除
        await clientAdapter.clientModel.findByIdAndRemove(client.id).exec();
    });
});

describe('パスワード認可', () => {
    let client: Resources.IClient;
    beforeEach(async () => {
        client = await Resources.createClient();
        TEST_BODY_PASSWORD.client_id = client.id;
    });
    afterEach(async () => {
        // テストクライアント削除
        const clientAdapter = sskts.adapter.client(connection);
        await clientAdapter.clientModel.findByIdAndRemove(client.id).exec();
    });

    it('スコープ不足ならBAD_REQUEST', async () => {
        const data = { ...TEST_BODY_PASSWORD, ...{ scopes: undefined } };
        await supertest(app)
            .post('/oauth/token')
            .send(data)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.BAD_REQUEST)
            .then((response) => {
                assert(Array.isArray(response.body.errors));
            });
    });

    it('ユーザーネーム不足ならBAD_REQUEST', async () => {
        const data = { ...TEST_BODY_PASSWORD, ...{ username: undefined } };
        await supertest(app)
            .post('/oauth/token')
            .send(data)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.BAD_REQUEST)
            .then((response) => {
                assert(Array.isArray(response.body.errors));
            });
    });

    it('パスワード不足ならBAD_REQUEST', async () => {
        const data = { ...TEST_BODY_PASSWORD, ...{ password: undefined } };
        await supertest(app)
            .post('/oauth/token')
            .send(data)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.BAD_REQUEST)
            .then((response) => {
                assert(Array.isArray(response.body.errors));
            });
    });

    it('会員存在しなければBAD_REQUEST', async () => {
        await supertest(app)
            .post('/oauth/token')
            .send(TEST_BODY_PASSWORD)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.BAD_REQUEST)
            .then((response) => {
                assert(Array.isArray(response.body.errors));
            });
    });

    it('パスワードが間違っていればBAD_REQUEST', async () => {
        // テスト会員作成
        const memberOwner = await sskts.factory.owner.member.create({
            username: TEST_USERNAME,
            password: TEST_PASSWORD,
            name_first: 'xxx',
            name_last: 'xxx',
            email: process.env.SSKTS_DEVELOPER_EMAIL
        });
        const ownerAdapter = sskts.adapter.owner(connection);
        await sskts.service.member.signUp(memberOwner)(ownerAdapter);

        const data = { ...TEST_BODY_PASSWORD, ...{ password: `${TEST_BODY_PASSWORD.password}x` } };
        await supertest(app)
            .post('/oauth/token')
            .send(data)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.BAD_REQUEST)
            .then((response) => {
                assert(Array.isArray(response.body.errors));
            });

        // テストクライアント削除
        await ownerAdapter.model.findByIdAndRemove(memberOwner.id).exec();
    });

    it('資格情報取得成功', async () => {
        // テスト会員作成
        const memberOwner = await sskts.factory.owner.member.create({
            username: TEST_USERNAME,
            password: TEST_PASSWORD,
            name_first: 'xxx',
            name_last: 'xxx',
            email: process.env.SSKTS_DEVELOPER_EMAIL
        });
        const ownerAdapter = sskts.adapter.owner(connection);
        await sskts.service.member.signUp(memberOwner)(ownerAdapter);

        const credentials = await supertest(app)
            .post('/oauth/token')
            .send(TEST_BODY_PASSWORD)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.OK)
            .then((response) => response.body);

        assert(typeof credentials.access_token, 'string');
        assert(typeof credentials.token_type, 'string');
        assert(typeof credentials.expires_in, 'number');

        // アクセストークンに適切にデータが含まれているはず
        const payload = <Express.IUser>await new Promise<any>((resolve, reject) => {
            jwt.verify(credentials.access_token, <string>process.env.SSKTS_API_SECRET, {}, (err, decoded) => {
                if (err instanceof Error) {
                    reject(err);
                } else {
                    resolve(<any>decoded);
                }
            });
        });
        assert.equal(payload.owner, memberOwner.id);
        assert.deepEqual(payload.scopes, TEST_BODY_CLIENT_CREDENTIALS.scopes);

        // テストクライアント削除
        await ownerAdapter.model.findByIdAndRemove(memberOwner.id).exec();
    });
});
