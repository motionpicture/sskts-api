"use strict";
/**
 * テストリソースファクトリー
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
const moment = require("moment");
const mongoose = require("mongoose");
let connection;
before(() => __awaiter(this, void 0, void 0, function* () {
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
}));
exports.THEATER_ID = '118';
function importMasters(date) {
    return __awaiter(this, void 0, void 0, function* () {
        const theaterAdapter = sskts.adapter.theater(connection);
        const filmAdapter = sskts.adapter.film(connection);
        const screenAdapter = sskts.adapter.screen(connection);
        const performanceAdapter = sskts.adapter.performance(connection);
        yield sskts.service.master.importTheater(exports.THEATER_ID)(theaterAdapter);
        yield sskts.service.master.importScreens(exports.THEATER_ID)(theaterAdapter, screenAdapter);
        yield sskts.service.master.importFilms(exports.THEATER_ID)(theaterAdapter, filmAdapter);
        yield sskts.service.master.importPerformances(exports.THEATER_ID, moment(date).format('YYYYMMDD'), moment(date).format('YYYYMMDD'))(filmAdapter, screenAdapter, performanceAdapter);
    });
}
exports.importMasters = importMasters;
function createClient() {
    return __awaiter(this, void 0, void 0, function* () {
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
        yield clientAdapter.clientModel.findByIdAndUpdate(client.id, client, { upsert: true }).exec();
        return client;
    });
}
exports.createClient = createClient;
function createMemberOwner() {
    return __awaiter(this, void 0, void 0, function* () {
        // テスト会員新規登録
        const TEST_USERNAME = `sskts-api:test:resources:${Date.now().toString()}`;
        const password = 'password';
        const memberOwner = yield sskts.factory.owner.member.create({
            username: TEST_USERNAME,
            password: password,
            name_first: 'xxx',
            name_last: 'xxx',
            email: process.env.SSKTS_DEVELOPER_EMAIL
        });
        const ownerAdapter = sskts.adapter.owner(connection);
        yield sskts.service.member.signUp(memberOwner)(ownerAdapter);
        // テストカード登録
        const card = sskts.factory.card.gmo.createUncheckedCardRaw({
            card_no: '4111111111111111',
            card_pass: '',
            expire: '2812',
            holder_name: 'AA BB'
        });
        yield sskts.service.member.addCard(memberOwner.id, card)();
        return Object.assign({}, memberOwner, { password: password });
    });
}
exports.createMemberOwner = createMemberOwner;
