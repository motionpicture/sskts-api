/**
 * oauthルーターテスト
 *
 * @ignore
 */

import * as sskts from '@motionpicture/sskts-domain';
import * as assert from 'assert';
import * as httpStatus from 'http-status';
import * as jwt from 'jsonwebtoken';
import * as mongoose from 'mongoose';
import * as supertest from 'supertest';

import * as app from '../app/app';

const TEST_VALID_CLIENT_ID = 'testclientid';
const TEST_VALID_BODY_CLIENT_CREDENTIALS = {
    grant_type: 'client_credentials',
    scopes: ['test'],
    client_id: TEST_VALID_CLIENT_ID,
    state: 'test'
};

let connection: mongoose.Connection;
before(async () => {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);

    // 全て削除してからテスト開始
    const clientAdapter = sskts.adapter.client(connection);
    await clientAdapter.clientModel.remove({}).exec();
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
                assert.equal(response.body.errors[0].title, 'Error');
                assert.equal(response.body.errors[0].detail, 'grant_type not implemented');
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
                assert.equal(response.body.errors[0].detail, 'invalid assertion');
            });
    });

    it('invalid scope', async () => {
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
                assert.equal(response.body.errors[0].detail, 'invalid scope');
            });
    });
});

describe('クライアント情報認可', () => {
    it('スコープ不足ならBAD_REQUEST', async () => {
        const data = { ...TEST_VALID_BODY_CLIENT_CREDENTIALS, ...{ scopes: undefined } };
        await supertest(app)
            .post('/oauth/token')
            .send(data)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.BAD_REQUEST)
            .then((response) => {
                assert(Array.isArray(response.body.errors));
                assert.equal(response.body.errors[0].source.parameter, 'scopes');
            });
    });

    it('クライアントID不足ならBAD_REQUEST', async () => {
        const data = { ...TEST_VALID_BODY_CLIENT_CREDENTIALS, ...{ client_id: undefined } };
        await supertest(app)
            .post('/oauth/token')
            .send(data)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.BAD_REQUEST)
            .then((response) => {
                assert(Array.isArray(response.body.errors));
                assert.equal(response.body.errors[0].source.parameter, 'client_id');
            });
    });

    it('ステート不足ならBAD_REQUEST', async () => {
        const data = { ...TEST_VALID_BODY_CLIENT_CREDENTIALS, ...{ state: undefined } };
        await supertest(app)
            .post('/oauth/token')
            .send(data)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.BAD_REQUEST)
            .then((response) => {
                assert(Array.isArray(response.body.errors));
                assert.equal(response.body.errors[0].source.parameter, 'state');
            });
    });

    it('クライアント存在しなければBAD_REQUEST', async () => {
        await supertest(app)
            .post('/oauth/token')
            .send(TEST_VALID_BODY_CLIENT_CREDENTIALS)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.BAD_REQUEST)
            .then((response) => {
                assert(Array.isArray(response.body.errors));
                assert.equal(response.body.errors[0].detail, 'client not found');
            });
    });

    it('資格情報取得成功', async () => {
        // テストクライアント作成
        const client = sskts.factory.client.create({
            id: TEST_VALID_CLIENT_ID,
            secret_hash: 'test',
            name: { en: '', ja: '' },
            description: { en: '', ja: '' },
            notes: { en: '', ja: '' },
            email: 'test@example.com'
        });
        const clientAdapter = sskts.adapter.client(connection);
        await clientAdapter.clientModel.findByIdAndUpdate(client.id, client, { new: true, upsert: true }).exec();

        const credentials = await supertest(app)
            .post('/oauth/token')
            .send(TEST_VALID_BODY_CLIENT_CREDENTIALS)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.OK)
            .then((response) => {
                return response.body;
            });

        assert(typeof credentials.access_token, 'string');
        assert(typeof credentials.token_type, 'string');
        assert(typeof credentials.expires_in, 'number');

        // アクセストークンに適切にデータが含まれているはず
        const payload = await new Promise<any>((resolve, reject) => {
            jwt.verify(credentials.access_token, <string>process.env.SSKTS_API_SECRET, {}, (err, decoded) => {
                if (err instanceof Error) {
                    reject(err);
                } else {
                    resolve(<any>decoded);
                }
            });
        });
        assert.equal(payload.client.id, TEST_VALID_BODY_CLIENT_CREDENTIALS.client_id);
        assert.equal(payload.state, TEST_VALID_BODY_CLIENT_CREDENTIALS.state);
        assert.deepEqual(payload.scopes, TEST_VALID_BODY_CLIENT_CREDENTIALS.scopes);

        // テストクライアント削除
        await clientAdapter.clientModel.findByIdAndRemove(client.id).exec();
    });
});
