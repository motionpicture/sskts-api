"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const mongoose = require("mongoose");
const monapt = require("monapt");
const OwnerFactory = require("../../../factory/owner");
const ownerGroup_1 = require("../../../model/ownerGroup");
const owner_1 = require("../mongoose/model/owner");
let db = mongoose.createConnection(process.env.MONGOLAB_URI);
let ownerModel = db.model(owner_1.default.modelName, owner_1.default.schema);
var interpreter;
(function (interpreter) {
    function findOne() {
        return __awaiter(this, void 0, void 0, function* () {
            let doc = yield ownerModel.findOne({ group: ownerGroup_1.default.ADMINISTRATOR }).exec();
            if (!doc)
                return monapt.None;
            let owner = OwnerFactory.createAdministrator({
                _id: doc.get("_id"),
                name: doc.get("name"),
            });
            return monapt.Option(owner);
        });
    }
    interpreter.findOne = findOne;
})(interpreter || (interpreter = {}));
let i = interpreter;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = i;
