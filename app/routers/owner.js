"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const express = require("express");
let router = express.Router();
const owner_1 = require("../../domain/default/repository/interpreter/owner");
const administrator_1 = require("../../domain/default/repository/interpreter/owner/administrator");
const owner_2 = require("../../domain/default/service/interpreter/owner");
router.post("/anonymous", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    let validatorResult = yield req.getValidationResult();
    if (!validatorResult.isEmpty())
        return next(new Error(validatorResult.array()[0].msg));
    try {
        let owner = yield owner_2.default.createAnonymous()(owner_1.default);
        res.status(201);
        res.setHeader("Location", `https://${req.headers["host"]}/owners/${owner._id}`);
        res.json({
            data: {
                type: "owners",
                _id: owner._id,
            }
        });
    }
    catch (error) {
        next(error);
    }
}));
router.patch("/anonymous/:id", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    let validatorResult = yield req.getValidationResult();
    if (!validatorResult.isEmpty())
        return next(new Error(validatorResult.array()[0].msg));
    try {
        yield owner_2.default.updateAnonymous({
            _id: req.params.id,
            name_first: req.body.name_first,
            name_last: req.body.name_last,
            tel: req.body.tel,
            email: req.body.email,
        })(owner_1.default);
        res.status(204).end();
    }
    catch (error) {
        next(error);
    }
}));
router.get("/administrator", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    let validatorResult = yield req.getValidationResult();
    if (!validatorResult.isEmpty())
        return next(new Error(validatorResult.array()[0].msg));
    try {
        let owner = yield owner_2.default.getAdministrator()(administrator_1.default);
        res.json({
            data: {
                type: "owners",
                _id: owner._id,
                attributes: owner
            }
        });
    }
    catch (error) {
        next(error);
    }
}));
router.get("/:id", (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    let validatorResult = yield req.getValidationResult();
    if (!validatorResult.isEmpty())
        return next(new Error(validatorResult.array()[0].msg));
    try {
        let option = yield owner_1.default.findById(req.params.id);
        option.match({
            Some: (owner) => {
                res.json({
                    data: {
                        type: "owners",
                        _id: owner._id,
                        attributes: owner
                    }
                });
            },
            None: () => {
                res.status(404);
                res.json({
                    data: null
                });
            }
        });
    }
    catch (error) {
        next(error);
    }
}));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = router;
