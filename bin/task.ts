/**
 * タスク実行インターフェース
 *
 * @ignore
 */
import * as sskts from '@motionpicture/sskts-domain';
import * as program from 'commander';
import * as createdebug from 'debug';
import * as mongoose from 'mongoose';

const debug = createdebug('sskts-api:*');

program
    .version('0.0.1');

program
    .command('importTheater <theaterCode>')
    .description('import theater from COA.')
    .action(async (theaterCode) => {
        try {
            debug('mongoose connecting...');
            mongoose.connect(process.env.MONGOLAB_URI);

            const theaterRepository = sskts.createTheaterRepository(mongoose.connection);
            debug('repository created.');
            debug('importing theater...');
            await sskts.service.master.importTheater(theaterCode)(theaterRepository);
            debug('theater imported.');
        } catch (error) {
            console.error(error);
        }

        mongoose.disconnect();
    });

program
    .command('importFilms <theaterCode>')
    .description('import films from COA.')
    .action(async (theaterCode) => {
        try {
            mongoose.connect(process.env.MONGOLAB_URI);

            await sskts.service.master.importFilms(theaterCode)(
                sskts.createTheaterRepository(mongoose.connection),
                sskts.createFilmRepository(mongoose.connection)
            );
        } catch (error) {
            console.error(error);
        }

        mongoose.disconnect();
    });

program
    .command('importScreens <theaterCode>')
    .description('import screens from COA.')
    .action(async (theaterCode) => {
        try {
            mongoose.connect(process.env.MONGOLAB_URI);

            await sskts.service.master.importScreens(theaterCode)(
                sskts.createTheaterRepository(mongoose.connection),
                sskts.createScreenRepository(mongoose.connection)
            );
        } catch (error) {
            console.error(error);
        }

        mongoose.disconnect();
    });

program
    .command('importPerformances <theaterCode> <day_start> <day_end>')
    .description('import performances from COA.')
    .action(async (theaterCode, start, end) => {
        try {
            mongoose.connect(process.env.MONGOLAB_URI);

            await sskts.service.master.importPerformances(theaterCode, start, end)(
                sskts.createFilmRepository(mongoose.connection),
                sskts.createScreenRepository(mongoose.connection),
                sskts.createPerformanceRepository(mongoose.connection)
            );
        } catch (error) {
            console.error(error);
        }

        mongoose.disconnect();
    });

program
    .command('*')
    .action((env) => {
        debug('deploying "%s"', env);
    });

program.parse(process.argv);
