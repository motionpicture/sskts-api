/**
 * OAuthシナリオ
 * @ignore
 */

import * as sskts from '@motionpicture/sskts-domain';
import * as httpStatus from 'http-status';
import * as mongoose from 'mongoose';
import * as supertest from 'supertest';

import * as app from '../../app/app';

const TEST_PASSWORD = 'password';

let connection: mongoose.Connection;
before(async () => {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
});

export async function loginAsAdmin() {
    return await supertest(app)
        .post('/oauth/token')
        .send({
            assertion: process.env.SSKTS_API_REFRESH_TOKEN,
            scope: 'admin'
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(httpStatus.OK)
        .then((response) => <string>response.body.access_token);
}

export async function loginAsClient() {
    const TEST_CLIENT_ID = 'sskts-api:test:scenarios:oauth:';

    // テストクライアント作成
    const client = sskts.factory.client.create({
        id: TEST_CLIENT_ID,
        secret_hash: 'test',
        name: { en: '', ja: '' },
        description: { en: '', ja: '' },
        notes: { en: '', ja: '' },
        email: 'test@example.com'
    });
    const clientAdapter = sskts.adapter.client(connection);
    await clientAdapter.clientModel.findByIdAndUpdate(client.id, client, { upsert: true }).exec();

    return await supertest(app)
        .post('/oauth/token')
        .send({
            grant_type: 'client_credentials',
            scopes: ['test'],
            client_id: TEST_CLIENT_ID,
            state: 'test'
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(httpStatus.OK)
        .then((response) => <string>response.body.access_token);
}

export async function loginAsMember(scopes: string[]) {
    const TEST_USERNAME = `sskts-api:test:scenarios:oauth:${Date.now().toString()}`;

    // テスト会員作成
    const memberOwner = await sskts.factory.owner.member.create({
        username: TEST_USERNAME,
        password: TEST_PASSWORD,
        name_first: 'xxx',
        name_last: 'xxx',
        email: 'test@example.com'
    });
    const ownerAdapter = sskts.adapter.owner(connection);
    await ownerAdapter.model.findByIdAndUpdate(memberOwner.id, memberOwner, { upsert: true }).exec();

    return await supertest(app)
        .post('/oauth/token')
        .send({
            grant_type: 'password',
            scopes: scopes,
            username: TEST_USERNAME,
            password: TEST_PASSWORD
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(httpStatus.OK)
        .then((response) => <string>response.body.access_token);
}
