/**
 * theatersルーターテスト
 *
 * @ignore
 */
import * as assert from 'assert';
import * as HTTPStatus from 'http-status';
import * as supertest from 'supertest';

import * as app from '../app/app';

describe('GET /theaters/:id', () => {
    it('found', (done) => {
        supertest(app)
            .get('/theaters/118')
            .set('authorization', 'Bearer ' + process.env.SSKTS_API_ACCESS_TOKEN)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(HTTPStatus.OK)
            .then((response) => {
                assert.equal(response.body.data.type, 'theaters');
                assert.equal(response.body.data.id, '118');
                assert.equal(response.body.data.attributes.id, '118');
                done();
            }).catch((err) => {
                done(err);
            });
    });

    it('not found', (done) => {
        supertest(app)
            .get('/theaters/0000000000')
            .set('authorization', 'Bearer ' + process.env.SSKTS_API_ACCESS_TOKEN)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(HTTPStatus.NOT_FOUND)
            .then((response) => {
                assert.equal(response.body.data, null);
                done();
            }).catch((err) => {
                done(err);
            });
    });
});
