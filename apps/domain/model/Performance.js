"use strict";
class Performance {
    constructor(_id, theater, theater_name, screen, screen_name, film, day, time_start, time_end, canceled) {
        this._id = _id;
        this.theater = theater;
        this.theater_name = theater_name;
        this.screen = screen;
        this.screen_name = screen_name;
        this.film = film;
        this.day = day;
        this.time_start = time_start;
        this.time_end = time_end;
        this.canceled = canceled;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Performance;
