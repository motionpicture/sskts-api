"use strict";
const film_1 = require("./mongoose/model/film");
var interpreter;
(function (interpreter) {
    function findById(id) {
        return new Promise((resolve, reject) => {
            film_1.default.findOne({ _id: id }).lean().exec().then((film) => {
                resolve(film);
            }).catch((err) => {
                reject(err);
            });
        });
    }
    interpreter.findById = findById;
    function store(film) {
        return new Promise((resolve, reject) => {
            console.log("updating film...");
            film_1.default.findOneAndUpdate({
                _id: film._id
            }, film, {
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
