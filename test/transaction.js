"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const request = require("request-promise-native");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        let body;
        body = yield request.post({
            url: "http://localhost:8080/owner/anonymous/create",
            body: {
                group: "ANONYMOUS",
            },
            json: true
        });
        let owner = body.owner;
        console.log("owner:", owner);
        body = yield request.post({
            url: "http://localhost:8080/transaction/start",
            body: {
                owners: ["5868e16789cc75249cdbfa4b", owner._id]
            },
            json: true
        });
        let transaction = body.transaction;
        console.log("transaction:", transaction);
        body = yield request.post({
            url: `http://localhost:8080/transaction/${transaction._id}/addGMOAuthorization`,
            body: {
                password: "password",
            },
            json: true
        });
        if (!body.success)
            throw new Error("fail in addGMOAuthorization.");
        console.log("addGMOAuthorization result:", body);
        body = yield request.post({
            url: `http://localhost:8080/transaction/${transaction._id}/close`,
            body: {
                password: "password"
            },
            json: true
        });
        console.log("close result:", body);
    });
}
main();
