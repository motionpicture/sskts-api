"use strict";
const theater_1 = require("./mongoose/model/theater");
var interpreter;
(function (interpreter) {
    function findById(id) {
        return new Promise((resolve, reject) => {
            theater_1.default.findOne({ _id: id }).lean().exec().then((theater) => {
                resolve(theater);
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
