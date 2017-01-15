"use strict";
const TheaterModel = require("../../../common/models/theater");
var interpreter;
(function (interpreter) {
    function findById(id) {
        return new Promise((resolve, reject) => {
            TheaterModel.default.findOne({
                _id: id
            }).lean().exec((err, theater) => {
                if (err)
                    return reject(err);
                if (!theater)
                    return reject(new Error("not found."));
                resolve(theater);
            });
        });
    }
    interpreter.findById = findById;
    function store(theater) {
        return new Promise((resolve, reject) => {
            console.log("updating theater...");
            TheaterModel.default.findOneAndUpdate({
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
