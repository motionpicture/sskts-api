"use strict";
const film_1 = require("../model/film");
function create(args) {
    return new film_1.default(args._id, args.coa_title_code, args.coa_title_branch_num, args.theater, args.name, args.name_kana, args.name_short, args.name_original, args.minutes, args.date_start, args.date_end, (args.kbn_eirin === undefined) ? "" : args.kbn_eirin, (args.kbn_eizou === undefined) ? "" : args.kbn_eizou, (args.kbn_joueihousiki === undefined) ? "" : args.kbn_joueihousiki, (args.kbn_jimakufukikae === undefined) ? "" : args.kbn_jimakufukikae);
}
exports.create = create;
;
