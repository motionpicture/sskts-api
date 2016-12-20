import * as COA from "../../common/utils/coa";
import config = require('config');
import mongoose = require('mongoose');
let MONGOLAB_URI = config.get<string>('mongolab_uri');
import {screen as screenModel} from "../../common/models";

/**
 * 劇場コード指定でスクリーン情報をCOAからインポートする
 */
export function importByTheaterCode(theaterCode: string): void {
    COA.findScreensByTheaterCode(theaterCode, (err, screens) => {
        if (err) return process.exit(0);

        mongoose.connect(MONGOLAB_URI);
        // あれば更新、なければ追加
        let promises = screens.map((screen) => {
            return new Promise((resolve, reject) => {
                if (!screen.screen_code) return resolve();

                let seats = screen.list_seat.map((seat) => {
                    return {
                        code: seat.seat_num
                    };
                });

                // this.logger.debug('updating sponsor...');
                screenModel.findOneAndUpdate(
                    {
                        _id: screen.screen_code
                    },
                    {
                        theater: theaterCode,
                        name: {
                            ja: screen.screen_name,
                            en: screen.screen_name_eng
                        },
                        sections: [
                            {
                                code: "001",
                                name: {
                                    ja: "セクション001",
                                    en: "section001",
                                },
                                seats: seats
                            }
                        ]
                    },
                    {
                        new: true,
                        upsert: true
                    },
                    (err) => {
                        console.log('screen updated.', err);
                        // this.logger.debug('sponsor updated', err);
                        (err) ? reject(err) : resolve();
                    }
                );
            });
        });

        Promise.all(promises).then(() => {
            // this.logger.info('promised.');
            mongoose.disconnect();
            process.exit(0);
        }, (err) => {
            // this.logger.error('promised.', err);
            mongoose.disconnect();
            process.exit(0);
        });
    });
}