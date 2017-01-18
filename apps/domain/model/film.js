"use strict";
class Film {
    constructor(_id, coa_title_code, coa_title_branch_num, theater, name, name_kana, name_short, name_original, minutes, date_start, date_end, kbn_eirin, kbn_eizou, kbn_joueihousiki, kbn_jimakufukikae) {
        this._id = _id;
        this.coa_title_code = coa_title_code;
        this.coa_title_branch_num = coa_title_branch_num;
        this.theater = theater;
        this.name = name;
        this.name_kana = name_kana;
        this.name_short = name_short;
        this.name_original = name_original;
        this.minutes = minutes;
        this.date_start = date_start;
        this.date_end = date_end;
        this.kbn_eirin = kbn_eirin;
        this.kbn_eizou = kbn_eizou;
        this.kbn_joueihousiki = kbn_joueihousiki;
        this.kbn_jimakufukikae = kbn_jimakufukikae;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Film;
