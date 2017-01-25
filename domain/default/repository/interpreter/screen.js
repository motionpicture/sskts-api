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
const ScreenFactory = require("../../factory/screen");
const screen_1 = require("./mongoose/model/screen");
let db = mongoose.createConnection(process.env.MONGOLAB_URI);
let screenModel = db.model(screen_1.default.modelName, screen_1.default.schema);
var interpreter;
(function (interpreter) {
    function findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let doc = yield screenModel.findOne({ _id: id })
                .populate("theater")
                .exec();
            if (!doc)
                return monapt.None;
            let screen = ScreenFactory.create({
                _id: doc.get("_id"),
                theater: doc.get("theater"),
                coa_screen_code: doc.get("coa_screen_code"),
                name: doc.get("name"),
                sections: doc.get("sections")
            });
            return monapt.Option(screen);
        });
    }
    interpreter.findById = findById;
    function findByTheater(theaterCode) {
        return __awaiter(this, void 0, void 0, function* () {
            let docs = yield screenModel.find({ theater: theaterCode })
                .populate("theater")
                .exec();
            return docs.map((doc) => {
                return ScreenFactory.create({
                    _id: doc.get("_id"),
                    theater: doc.get("theater"),
                    coa_screen_code: doc.get("coa_screen_code"),
                    name: doc.get("name"),
                    sections: doc.get("sections")
                });
            });
        });
    }
    interpreter.findByTheater = findByTheater;
    function store(screen) {
        return __awaiter(this, void 0, void 0, function* () {
            yield screenModel.findOneAndUpdate({ _id: screen._id }, screen, {
                new: true,
                upsert: true
            }).lean().exec();
        });
    }
    interpreter.store = store;
})(interpreter || (interpreter = {}));
let i = interpreter;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = i;
