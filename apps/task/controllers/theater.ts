import * as COA from "../../common/utils/coa";
import config = require('config');
import mongoose = require('mongoose');
let MONGOLAB_URI = config.get<string>('mongolab_uri');
import {theater as theaterModel} from "../../common/models";

/**
 * コード指定で劇場情報をCOAからインポートする
 */
export function importByCode(code: string) {
    mongoose.connect(MONGOLAB_URI);

    return new Promise((resolve, reject) => {
        COA.findTheaterByCode(code, (err, theater) => {
            console.log('request COA processed.', err, theater);
            if (err) return reject(err);

            // あれば更新、なければ追加
            console.log('updating theater...');
            // this.logger.debug('updating sponsor...');
            theaterModel.findOneAndUpdate(
                {
                    _id: theater.theater_code
                },
                {
                    name: {
                        ja: theater.theater_name,
                        en: theater.theater_name_eng
                    },
                    name_kana: theater.theater_name_kana
                },
                {
                    new: true,
                    upsert: true
                },
                (err) => {
                    console.log('theater updated.', err);
                    // this.logger.debug('sponsor updated', err);
                    (err) ? reject(err) : resolve();
                }
            );
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
