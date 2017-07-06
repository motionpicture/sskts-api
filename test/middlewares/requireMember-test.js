"use strict";
/**
 * 会員必須ミドルウェアテスト
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
const requireMember = require("../../app/middlewares/requireMember");
let TEST_USER;
before(() => {
    TEST_USER = sskts.factory.clientUser.create({
        client: 'xxx',
        state: 'xxx',
        owner: 'xxx',
        scopes: ['test']
    });
});
describe('会員必須ミドルウェア 会員かどうか', () => {
    it('所有者が定義されているので会員', () => __awaiter(this, void 0, void 0, function* () {
        assert(requireMember.isMember(TEST_USER));
    }));
    it('所有者が定義されていないので会員ではない', () => __awaiter(this, void 0, void 0, function* () {
        const user = Object.assign({}, TEST_USER, { owner: undefined });
        assert(!requireMember.isMember(user));
    }));
});
