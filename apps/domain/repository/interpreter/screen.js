"use strict";
const ScreenModel = require("../../../common/models/screen");
var interpreter;
(function (interpreter) {
    function find(id) {
        return new Promise((resolve, reject) => {
            reject(new Error("now coding..."));
        });
    }
    interpreter.find = find;
    function findByTheater(theaterCode) {
        return new Promise((resolve, reject) => {
            reject(new Error("now coding..."));
        });
    }
    interpreter.findByTheater = findByTheater;
    function store(screen) {
        return new Promise((resolve, reject) => {
            console.log("updating screen...");
            ScreenModel.default.findOneAndUpdate({
                _id: screen._id
            }, screen, {
                new: true,
                upsert: true
            }, (err, screen) => {
                console.log("screen updated.", screen);
                (err) ? reject(err) : resolve();
            });
        });
    }
    interpreter.store = store;
})(interpreter || (interpreter = {}));
let i = interpreter;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = i;
