/**
 * テストリソースファクトリー
 *
 * @ignore
 */

import * as sskts from '@motionpicture/sskts-domain';
import * as moment from 'moment';
import * as mongoose from 'mongoose';

let connection: mongoose.Connection;
before(async () => {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
});

export type IClient = sskts.factory.client.IClient;
export type IMemberOwner = sskts.factory.owner.member.IOwner & { password: string };

export const THEATER_ID = '118';

export async function importMasters(date: Date) {
    const theaterAdapter = sskts.adapter.theater(connection);
    const filmAdapter = sskts.adapter.film(connection);
    const screenAdapter = sskts.adapter.screen(connection);
    const performanceAdapter = sskts.adapter.performance(connection);

    await sskts.service.master.importTheater(THEATER_ID)(theaterAdapter);
    await sskts.service.master.importScreens(THEATER_ID)(theaterAdapter, screenAdapter);
    await sskts.service.master.importFilms(THEATER_ID)(theaterAdapter, filmAdapter);
    await sskts.service.master.importPerformances(
        THEATER_ID,
        moment(date).format('YYYYMMDD'),
        moment(date).format('YYYYMMDD')
    )(filmAdapter, screenAdapter, performanceAdapter);
}

export async function createClient(): Promise<IClient> {
    // テストクライアント作成
    const TEST_CLIENT_ID = `sskts-api:test:resources:${Date.now().toString()}`;
    const client = sskts.factory.client.create({
        id: TEST_CLIENT_ID,
        secret_hash: 'test',
        name: { en: '', ja: '' },
        description: { en: '', ja: '' },
        notes: { en: '', ja: '' },
        email: process.env.SSKTS_DEVELOPER_EMAIL
    });
    const clientAdapter = sskts.adapter.client(connection);
    await clientAdapter.clientModel.findByIdAndUpdate(client.id, client, { upsert: true }).exec();

    return client;
}

export async function createMemberOwner(): Promise<IMemberOwner> {
    // テスト会員新規登録
    const TEST_USERNAME = `sskts-api:test:resources:${Date.now().toString()}`;
    const password = 'password';
    const memberOwner = await sskts.factory.owner.member.create({
        username: TEST_USERNAME,
        password: password,
        name_first: 'xxx',
        name_last: 'xxx',
        email: process.env.SSKTS_DEVELOPER_EMAIL
    });
    const ownerAdapter = sskts.adapter.owner(connection);
    await sskts.service.member.signUp(memberOwner)(ownerAdapter);

    // テストカード登録
    const card = sskts.factory.card.gmo.createUncheckedCardRaw({
        card_no: '4111111111111111',
        card_pass: '', // パスワードを空で登録すれば使用する時にパスワードは不要
        expire: '2812',
        holder_name: 'AA BB'
    });
    await sskts.service.member.addCard(memberOwner.id, card)();

    return { ...memberOwner, ...{ password: password } };
}
