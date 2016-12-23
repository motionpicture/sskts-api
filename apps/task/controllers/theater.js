"use strict";
const COA = require("../../common/utils/coa");
const config = require("config");
const mongoose = require("mongoose");
let MONGOLAB_URI = config.get('mongolab_uri');
const models_1 = require("../../common/models");
/**
 * コード指定で劇場情報をCOAからインポートする
 */
function importByCode(code) {
    mongoose.connect(MONGOLAB_URI);
    return new Promise((resolve, reject) => {
        COA.findTheaterInterface.call({
            theater_code: code
        }, (err, theater) => {
            console.log('request COA processed.', err, theater);
            if (err)
                return reject(err);
            // あれば更新、なければ追加
            console.log('updating theater...');
            // this.logger.debug('updating sponsor...');
            models_1.theater.findOneAndUpdate({
                _id: theater.theater_code
            }, {
                name: {
                    ja: theater.theater_name,
                    en: theater.theater_name_eng
                },
                name_kana: theater.theater_name_kana
            }, {
                new: true,
                upsert: true
            }, (err) => {
                console.log('theater updated.', err);
                // this.logger.debug('sponsor updated', err);
                (err) ? reject(err) : resolve();
            });
        });
    }).then(() => {
        // this.logger.info('promised.');
        mongoose.disconnect();
        process.exit(0);
    }, (err) => {
        // this.logger.error('promised.', err);
        mongoose.disconnect();
        process.exit(0);
    });
}
exports.importByCode = importByCode;
