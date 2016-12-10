import {BaseController} from './BaseController';
import {JsonController, Get} from "routing-controllers";
import mongoose = require('mongoose');
import conf = require('config');
let MONGOLAB_URI = conf.get<string>('mongolab_uri');

@JsonController("/dev")
export class DevController extends BaseController {
    @Get("/environmentVariables")
    environmentVariables() {
        this.logger.debug('debugdebugdebugdebugdebugdebugdebugdebugdebugdebugdebugdebugdebug');
        return {
            success: true,
            variables: process.env
        };
    }

    @Get("/mongoose/connect")
    connectMongoose() {
        return new Promise((resolve, reject) => {
            mongoose.connect(MONGOLAB_URI, (err) => {
                (err) ? reject(err) : resolve();
            });
        }).then(() => {
            return {
                success: true,
                message: 'connected.'
            }
        }, (err) => {
            return {
                success: false,
                message: err.message
            }
        });
    }

    @Get("/mongoose/disconnect")
    disconnectMongoose() {
        return new Promise((resolve, reject) => {
            mongoose.disconnect((err) => {
                (err) ? reject(err) : resolve();
            });
        }).then(() => {
            return {
                success: true,
                message: 'disconnected.'
            }
        }, (err) => {
            return {
                success: false,
                message: err.message
            }
        });
    }
}
