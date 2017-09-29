/**
 * exprerssアプリケーションテスト
 * @ignore
 */

import * as assert from 'assert';
import * as supertest from 'supertest';

import * as app from './app';

describe('/dev/uncaughtexception', () => {
    it('環境が本番でなければエラーになるはず', (done) => {
        process.prependOnceListener('uncaughtException', (err) => {
            assert(err instanceof Error);
            done();
        });

        supertest(app)
            .get('/dev/uncaughtexception')
            .set('Accept', 'application/json')
            .send({})
            .then();
    });
});
