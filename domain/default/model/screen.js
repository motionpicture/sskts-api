"use strict";
class Screen {
    constructor(_id, theater, coa_screen_code, name, sections) {
        this._id = _id;
        this.theater = theater;
        this.coa_screen_code = coa_screen_code;
        this.name = name;
        this.sections = sections;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Screen;
