"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
const BaseController_1 = require('./BaseController');
const routing_controllers_1 = require("routing-controllers");
const mongoose = require('mongoose');
const conf = require('config');
let MONGOLAB_URI = conf.get('mongolab_uri');
let DevController = class DevController extends BaseController_1.BaseController {
    environmentVariables() {
        this.logger.debug('debugdebugdebugdebugdebugdebugdebugdebugdebugdebugdebugdebugdebug');
        return {
            success: true,
            variables: process.env
        };
    }
    connectMongoose() {
        return new Promise((resolve, reject) => {
            mongoose.connect(MONGOLAB_URI, (err) => {
                (err) ? reject(err) : resolve();
            });
        }).then(() => {
            return {
                success: true,
                message: 'connected.'
            };
        }, (err) => {
            return {
                success: false,
                message: err.message
            };
        });
    }
    disconnectMongoose() {
        return new Promise((resolve, reject) => {
            mongoose.disconnect((err) => {
                (err) ? reject(err) : resolve();
            });
        }).then(() => {
            return {
                success: true,
                message: 'disconnected.'
            };
        }, (err) => {
            return {
                success: false,
                message: err.message
            };
        });
    }
};
__decorate([
    routing_controllers_1.Get("/environmentVariables"), 
    __metadata('design:type', Function), 
    __metadata('design:paramtypes', []), 
    __metadata('design:returntype', void 0)
], DevController.prototype, "environmentVariables", null);
__decorate([
    routing_controllers_1.Get("/mongoose/connect"), 
    __metadata('design:type', Function), 
    __metadata('design:paramtypes', []), 
    __metadata('design:returntype', void 0)
], DevController.prototype, "connectMongoose", null);
__decorate([
    routing_controllers_1.Get("/mongoose/disconnect"), 
    __metadata('design:type', Function), 
    __metadata('design:paramtypes', []), 
    __metadata('design:returntype', void 0)
], DevController.prototype, "disconnectMongoose", null);
DevController = __decorate([
    routing_controllers_1.JsonController("/dev"), 
    __metadata('design:paramtypes', [])
], DevController);
exports.DevController = DevController;
