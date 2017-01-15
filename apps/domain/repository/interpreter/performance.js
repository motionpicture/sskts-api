"use strict";
const performance_1 = require("./mongoose/model/performance");
var interpreter;
(function (interpreter) {
    function findById(id) {
        return new Promise((resolve, reject) => {
            performance_1.default.findOne({ _id: id }).lean().exec().then((performance) => {
                resolve(performance);
            }).catch((err) => {
                reject(err);
            });
        });
    }
    interpreter.findById = findById;
    function store(performance) {
        return new Promise((resolve, reject) => {
            console.log("updating performance...");
            performance_1.default.findOneAndUpdate({ _id: performance._id }, performance, {
                new: true,
                upsert: true,
            }).lean().exec().then(() => {
                console.log("performance updated.");
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
