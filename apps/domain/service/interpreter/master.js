"use strict";
const TheaterFactory = require("../../factory/theater");
const COA = require("@motionpicture/coa-service");
var interpreter;
(function (interpreter) {
    function importTheater(code) {
        return (repository) => {
            return new Promise((resolve, reject) => {
                COA.findTheaterInterface.call({
                    theater_code: code
                }, (err, theaterByCOA) => {
                    if (err)
                        return reject(err);
                    if (!theaterByCOA)
                        return reject(new Error("theater not found."));
                    let theater = TheaterFactory.createByCOA(theaterByCOA);
                    repository.store(theater).then(() => {
                        resolve();
                    }, (err) => {
                        reject(err);
                    });
                });
            });
        };
    }
    interpreter.importTheater = importTheater;
    function importFilms(theaterCode) {
        return (repository) => {
            return new Promise((resolve, reject) => {
                reject(new Error("now coding..."));
            });
        };
    }
    interpreter.importFilms = importFilms;
    function importScreens(theaterCode) {
        return (repository) => {
            return new Promise((resolve, reject) => {
                reject(new Error("now coding..."));
            });
        };
    }
    interpreter.importScreens = importScreens;
    function importPerformances(theaterCode, dayStart, dayEnd) {
        return (repository) => {
            return new Promise((resolve, reject) => {
                reject(new Error("now coding..."));
            });
        };
    }
    interpreter.importPerformances = importPerformances;
})(interpreter || (interpreter = {}));
let s = interpreter;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = s;
