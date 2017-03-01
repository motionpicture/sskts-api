"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * タスク実行インターフェース
 *
 * @ignore
 */
const sskts = require("@motionpicture/sskts-domain");
const program = require("commander");
const createdebug = require("debug");
const mongoose = require("mongoose");
const debug = createdebug('sskts-api:*');
program
    .version('0.0.1');
program
    .command('importTheater <theaterCode>')
    .description('import theater from COA.')
    .action((theaterCode) => __awaiter(this, void 0, void 0, function* () {
    try {
        debug('mongoose connecting...');
        mongoose.connect(process.env.MONGOLAB_URI);
        const theaterRepository = sskts.createTheaterRepository(mongoose.connection);
        debug('repository created.');
        debug('importing theater...');
        yield sskts.service.master.importTheater(theaterCode)(theaterRepository);
        debug('theater imported.');
    }
    catch (error) {
        console.error(error);
    }
    mongoose.disconnect();
    process.exit(0);
}));
program
    .command('importFilms <theaterCode>')
    .description('import films from COA.')
    .action((theaterCode) => __awaiter(this, void 0, void 0, function* () {
    try {
        mongoose.connect(process.env.MONGOLAB_URI);
        yield sskts.service.master.importFilms(theaterCode)(sskts.createTheaterRepository(mongoose.connection), sskts.createFilmRepository(mongoose.connection));
    }
    catch (error) {
        console.error(error);
    }
    mongoose.disconnect();
    process.exit(0);
}));
program
    .command('importScreens <theaterCode>')
    .description('import screens from COA.')
    .action((theaterCode) => __awaiter(this, void 0, void 0, function* () {
    try {
        mongoose.connect(process.env.MONGOLAB_URI);
        yield sskts.service.master.importScreens(theaterCode)(sskts.createTheaterRepository(mongoose.connection), sskts.createScreenRepository(mongoose.connection));
    }
    catch (error) {
        console.error(error);
    }
    mongoose.disconnect();
    process.exit(0);
}));
program
    .command('importPerformances <theaterCode> <day_start> <day_end>')
    .description('import performances from COA.')
    .action((theaterCode, start, end) => __awaiter(this, void 0, void 0, function* () {
    try {
        mongoose.connect(process.env.MONGOLAB_URI);
        yield sskts.service.master.importPerformances(theaterCode, start, end)(sskts.createFilmRepository(mongoose.connection), sskts.createScreenRepository(mongoose.connection), sskts.createPerformanceRepository(mongoose.connection));
    }
    catch (error) {
        console.error(error);
    }
    process.exit(0);
}));
program
    .command('*')
    .action((env) => {
    debug('deploying "%s"', env);
});
program.parse(process.argv);
