"use strict";
/**
 * 取引シナリオ
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
const httpStatus = require("http-status");
const moment = require("moment");
const supertest = require("supertest");
const app = require("../../app/app");
/**
 * 匿名で取引開始する
 *
 * @param {string} accessToken アクセストークン
 * @returns 開始結果
 */
function start(accessToken) {
    return __awaiter(this, void 0, void 0, function* () {
        // 取引開始
        const transaction = yield supertest(app)
            .post('/transactions/startIfPossible')
            .set('authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .send({
            // tslint:disable-next-line:no-magic-numbers
            expires_at: moment().add(30, 'minutes').unix()
        })
            .expect(httpStatus.OK)
            .then((response) => response.body.data);
        const owners = transaction.attributes.owners;
        const anonymousOwner = owners.find((owner) => owner.group !== sskts.factory.ownerGroup.PROMOTER);
        const promoterOwner = owners.find((owner) => owner.group === sskts.factory.ownerGroup.PROMOTER);
        return {
            transactionId: transaction.id,
            ownerId: anonymousOwner.id,
            promoterOwnerId: promoterOwner.id
        };
    });
}
exports.start = start;
