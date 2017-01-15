"use strict";
const FilmModel = require("../../../common/models/film");
var interpreter;
(function (interpreter) {
    function find(id) {
        return new Promise((resolve, reject) => {
            reject(new Error("now coding..."));
        });
    }
    interpreter.find = find;
    function store(film) {
        return new Promise((resolve, reject) => {
            console.log("updating film...");
            FilmModel.default.findOneAndUpdate({
                _id: film._id
            }, film, {
                new: true,
                upsert: true
            }, (err, film) => {
                console.log("film updated.", film);
                (err) ? reject(err) : resolve();
            });
        });
    }
    interpreter.store = store;
})(interpreter || (interpreter = {}));
let i = interpreter;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = i;
