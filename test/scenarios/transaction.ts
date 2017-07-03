/**
 * 取引シナリオ
 *
 * @ignore
 */

import * as sskts from '@motionpicture/sskts-domain';
import * as httpStatus from 'http-status';
import * as moment from 'moment';
import * as supertest from 'supertest';

import * as app from '../../app/app';

/**
 * 匿名で取引開始する
 *
 * @param {string} accessToken アクセストークン
 * @returns 開始結果
 */
export async function start(accessToken: string) {
    // 取引開始
    const transaction = await supertest(app)
        .post('/transactions/startIfPossible')
        .set('authorization', `Bearer ${accessToken}`)
        .set('Accept', 'application/json')
        .send({
            // tslint:disable-next-line:no-magic-numbers
            expires_at: moment().add(30, 'minutes').unix()
        })
        .expect(httpStatus.OK)
        .then((response) => response.body.data);

    const owners: any[] = transaction.attributes.owners;
    const anonymousOwner = <sskts.factory.owner.anonymous.IOwner>owners.find(
        (owner) => owner.group !== sskts.factory.ownerGroup.PROMOTER
    );
    const promoterOwner = <sskts.factory.owner.anonymous.IOwner>owners.find(
        (owner) => owner.group === sskts.factory.ownerGroup.PROMOTER
    );

    return {
        transactionId: transaction.id,
        ownerId: anonymousOwner.id,
        promoterOwnerId: promoterOwner.id
    };
}
