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
const OwnerFactory = require("../../factory/owner");
var interpreter;
(function (interpreter) {
    function createAnonymous() {
        return (repository) => __awaiter(this, void 0, void 0, function* () {
            let owner = OwnerFactory.createAnonymous({
                _id: mongoose.Types.ObjectId().toString()
            });
            yield repository.store(owner);
            return owner;
        });
    }
    interpreter.createAnonymous = createAnonymous;
})(interpreter || (interpreter = {}));
let i = interpreter;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = i;
