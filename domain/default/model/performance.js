"use strict";
class Performance {
    constructor(_id, theater, screen, film, day, time_start, time_end, canceled) {
        this._id = _id;
        this.theater = theater;
        this.screen = screen;
        this.film = film;
        this.day = day;
        this.time_start = time_start;
        this.time_end = time_end;
        this.canceled = canceled;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Performance;
