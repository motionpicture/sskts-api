"use strict";
const monapt = require("monapt");
const Theater_1 = require("../../model/Theater");
const theater_1 = require("./mongoose/model/theater");
var interpreter;
(function (interpreter) {
    function findById(id) {
        return new Promise((resolve, reject) => {
            theater_1.default.findOne({ _id: id }).exec().then((theater) => {
                if (!theater)
                    return resolve(monapt.None);
                resolve(monapt.Option(new Theater_1.default(theater.get("_id"), theater.get("name"), theater.get("name_kana"), theater.get("address"))));
            }).catch((err) => {
                reject(err);
            });
        });
    }
    interpreter.findById = findById;
    function store(theater) {
        return new Promise((resolve, reject) => {
            console.log("updating theater...");
            theater_1.default.findOneAndUpdate({
                _id: theater._id
            }, theater, {
                new: true,
                upsert: true
            }).lean().exec().then(() => {
                console.log("screen updated.");
                resolve();
            }).catch((err) => {
                reject(err);
            });
        });
    }
    interpreter.store = store;
})(interpreter || (interpreter = {}));
let i = interpreter;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = i;
