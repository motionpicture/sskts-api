"use strict";
const PerformanceModel = require("../../../common/models/performance");
var interpreter;
(function (interpreter) {
    function findById(id) {
        return new Promise((resolve, reject) => {
            reject(new Error("now coding..."));
        });
    }
    interpreter.findById = findById;
    function store(performance) {
        return new Promise((resolve, reject) => {
            console.log("updating performance...");
            PerformanceModel.default.findOneAndUpdate({ _id: performance._id }, performance, {
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
