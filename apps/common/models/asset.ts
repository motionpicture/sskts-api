import mongoose = require('mongoose');
import * as ownerModel from './owner';
import * as authorizationModel from './authorization';

/** model name */
export var name = "Asset";

/**
 * 資産スキーマ
 */
export var schema = new mongoose.Schema({
    owner: { // 所有者
        type: mongoose.Schema.Types.ObjectId,
        ref: ownerModel.name,
        required: true
    },
    authorizations: [ // 承認リスト
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: authorizationModel.name
        }
    ]
},{
    collection: 'assets',
    timestamps: { 
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
});
