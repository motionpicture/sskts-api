"use strict";
const mongoose = require("mongoose");
exports.name = "Owner";
exports.schema = new mongoose.Schema({
    name: {
        ja: String,
        en: String
    },
    group: String,
    email: String,
    tel: String,
}, {
    collection: "owners",
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = mongoose.model(exports.name, exports.schema);
exports.GROUP_ADMINISTRATOR = "ADMINISTRATOR";
exports.GROUP_ANONYMOUS = "ANONYMOUS";
exports.GROUP_MEMBER = "MEMBER";
function isAvailableGroup(group) {
    return (group === exports.GROUP_ADMINISTRATOR
        || group === exports.GROUP_ANONYMOUS
        || group === exports.GROUP_MEMBER);
}
exports.isAvailableGroup = isAvailableGroup;
