"use strict";
const screen_1 = require("./mongoose/model/screen");
var interpreter;
(function (interpreter) {
    function findById(id) {
        return new Promise((resolve, reject) => {
            screen_1.default.findOne({ _id: id }).lean().exec().then((screen) => {
                resolve(screen);
            }).catch((err) => {
                reject(err);
            });
        });
    }
    interpreter.findById = findById;
    function findByTheater(theaterCode) {
        return new Promise((resolve, reject) => {
            screen_1.default.find({
                theater: theaterCode
            }).lean().exec().then((screens) => {
                resolve(screens);
            }, (err) => {
                reject(err);
            });
        });
    }
    interpreter.findByTheater = findByTheater;
    function store(screen) {
        return new Promise((resolve, reject) => {
            console.log("updating screen...");
            screen_1.default.findOneAndUpdate({ _id: screen._id }, screen, {
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
