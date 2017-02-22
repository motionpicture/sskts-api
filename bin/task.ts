/**
 * タスク実行インターフェース
 *
 * @ignore
 */
import * as SSKTS from '@motionpicture/sskts-domain';
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

            const theaterRepository = SSKTS.createTheaterRepository(mongoose.connection);
            debug('repository created.');
            debug('importing theater...');
            await SSKTS.MasterService.importTheater(theaterCode)(theaterRepository);
            debug('theater imported.');
        } catch (error) {
            console.error(error);
        }

        mongoose.disconnect();
        process.exit(0);
    });

program
    .command('importFilms <theaterCode>')
    .description('import films from COA.')
    .action(async (theaterCode) => {
        try {
            mongoose.connect(process.env.MONGOLAB_URI);

            await SSKTS.MasterService.importFilms(theaterCode)(
                SSKTS.createTheaterRepository(mongoose.connection),
                SSKTS.createFilmRepository(mongoose.connection)
            );
        } catch (error) {
            console.error(error);
        }

        mongoose.disconnect();
        process.exit(0);
    });

program
    .command('importScreens <theaterCode>')
    .description('import screens from COA.')
    .action(async (theaterCode) => {
        try {
            mongoose.connect(process.env.MONGOLAB_URI);

            await SSKTS.MasterService.importScreens(theaterCode)(
                SSKTS.createTheaterRepository(mongoose.connection),
                SSKTS.createScreenRepository(mongoose.connection)
            );
        } catch (error) {
            console.error(error);
        }

        mongoose.disconnect();
        process.exit(0);
    });

program
    .command('importPerformances <theaterCode> <day_start> <day_end>')
    .description('import performances from COA.')
    .action(async (theaterCode, start, end) => {
        try {
            mongoose.connect(process.env.MONGOLAB_URI);

            await SSKTS.MasterService.importPerformances(theaterCode, start, end)(
                SSKTS.createFilmRepository(mongoose.connection),
                SSKTS.createScreenRepository(mongoose.connection),
                SSKTS.createPerformanceRepository(mongoose.connection)
            );
        } catch (error) {
            console.error(error);
        }

        process.exit(0);
    });

program
    .command('*')
    .action((env) => {
        debug('deploying "%s"', env);
    });

program.parse(process.argv);
