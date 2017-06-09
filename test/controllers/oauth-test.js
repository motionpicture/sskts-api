"use strict";
/**
 * oauthコントローラーテスト
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
const mongoose = require("mongoose");
const oauthController = require("../../app/controllers/oauth");
describe('oauthコントローラー 主張から資格情報を発行する', () => {
    it('主張が不適切なので発行できない', () => __awaiter(this, void 0, void 0, function* () {
        let issueError;
        try {
            yield oauthController.issueCredentialsByAssertion('invalidassertion', ['admin']);
        }
        catch (error) {
            issueError = error;
        }
        assert(issueError instanceof Error);
    }));
    it('発行できる', () => __awaiter(this, void 0, void 0, function* () {
        const credentials = yield oauthController.issueCredentialsByAssertion(process.env.SSKTS_API_REFRESH_TOKEN, ['admin']);
        assert.equal(typeof credentials.access_token, 'string');
        assert.equal(typeof credentials.expires_in, 'number');
    }));
});
describe('oauthコントローラー クライアントIDから資格情報を発行する', () => {
    before(() => {
        mongoose.connect(process.env.MONGOLAB_URI);
    });
    it('クライアントが存在しないので発行できない', () => __awaiter(this, void 0, void 0, function* () {
        let issueError;
        try {
            yield oauthController.issueCredentialsByClient('invalidclient', ['admin']);
        }
        catch (error) {
            issueError = error;
        }
        assert(issueError instanceof Error);
    }));
    it('発行できる', () => __awaiter(this, void 0, void 0, function* () {
        // テストクライアント作成
        const client = sskts.factory.client.create({
            id: 'test',
            secret_hash: 'test',
            name: { en: '', ja: '' },
            description: { en: '', ja: '' },
            notes: { en: '', ja: '' },
            email: 'test@example.com'
        });
        const clientAdapter = sskts.adapter.client(mongoose.connection);
        yield clientAdapter.clientModel.findByIdAndUpdate(client.id, client, { new: true, upsert: true }).exec();
        const credentials = yield oauthController.issueCredentialsByClient(client.id, ['admin']);
        assert.equal(typeof credentials.access_token, 'string');
        assert.equal(typeof credentials.expires_in, 'number');
        // テストクライアント削除
        yield clientAdapter.clientModel.findByIdAndRemove(client.id).exec();
    }));
});
describe('oauthコントローラー 任意のデータをJWTを使用して資格情報へ変換する', () => {
    it('変換できる', () => __awaiter(this, void 0, void 0, function* () {
        const credentials = yield oauthController.payload2credentials({});
        assert.equal(typeof credentials.access_token, 'string');
        assert.equal(typeof credentials.expires_in, 'number');
    }));
});
