/**
 * oauthコントローラー
 *
 * @namespace controllers/oauth
 */

import * as sskts from '@motionpicture/sskts-domain';
import * as createDebug from 'debug';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import * as mongoose from 'mongoose';

const debug = createDebug('sskts-api:controllers:oauth');
// todo どこで定義するか
const ACCESS_TOKEN_EXPIRES_IN_SECONDS = 1800;

/**
 * 資格情報インターフェース
 *
 * @interface ICredentials
 */
export interface ICredentials {
    access_token: string;
    token_type: string;
    expires_in: number;
}

/**
 * 資格情報を発行する
 *
 * @param {Request} req リクエストオブジェクト
 * @returns {Promise<ICredentials>} 資格情報
 */
export async function issueCredentials(req: Request): Promise<ICredentials> {
    switch (req.body.grant_type) {
        case 'urn:ietf:params:oauth:grant-type:jwt-bearer':
            return await issueCredentialsByAssertion(req.body.assertion, req.body.scopes);

        case 'client_credentials':
            return await issueCredentialsByClient(req.body.client_id, req.body.scopes);

        default:
            // 非対応認可タイプ
            throw new Error('grant_type not implemented');
    }

    // usernameとpassword照合
    // const owner = await chevre.Models.Owner.findOne({ username: req.body.username }).exec();
    // if (owner === null) {
    //     throw new Error('owner not found');
    // }
    // if (owner.get('password_hash') !== chevre.CommonUtil.createHash(req.body.password, owner.get('password_salt'))) {
    //     throw new Error('invalid username or password');
    // }

}

/**
 * 主張から資格情報を発行する
 *
 * @param {string} assertion 主張
 * @param {string[]} scopes スコープリスト
 * @returns {Promise<ICredentials>} 資格情報
 */
export async function issueCredentialsByAssertion(assertion: string, scopes: string[]): Promise<ICredentials> {
    if (assertion !== process.env.SSKTS_API_REFRESH_TOKEN) {
        throw new Error('invalid assertion');
    }

    const payload = {
        scopes: scopes
    };

    return await payload2credentials(payload);
}

/**
 * クライアントIDから資格情報を発行する
 *
 * @param {string} clientId クライアントID
 * @param {string[]} scopes スコープリスト
 * @returns {Promise<ICredentials>} 資格情報
 */
export async function issueCredentialsByClient(clientId: string, scopes: string[]): Promise<ICredentials> {
    // クライアントの存在確認
    const clientAdapter = sskts.adapter.client(mongoose.connection);
    const clientDoc = await clientAdapter.clientModel.findById(clientId, 'name').exec();
    if (clientDoc === null) {
        throw new Error('client not found');
    }

    const payload = {
        client: clientDoc.toObject(),
        scopes: scopes
    };

    return await payload2credentials(payload);
}

/**
 * 任意のデータをJWTを使用して資格情報へ変換する
 *
 * @param {object} payload 変換したいデータ
 * @returns {Promise<ICredentials>} 資格情報
 */
export async function payload2credentials(payload: object): Promise<ICredentials> {
    return new Promise<ICredentials>((resolve, reject) => {
        debug('signing...', payload);
        jwt.sign(
            payload,
            process.env.SSKTS_API_SECRET,
            {
                expiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS
            },
            (err, encoded) => {
                debug('jwt signed', err, encoded);
                if (err instanceof Error) {
                    reject(err);
                } else {
                    resolve({
                        access_token: encoded,
                        token_type: 'Bearer',
                        expires_in: ACCESS_TOKEN_EXPIRES_IN_SECONDS
                    });
                }
            }
        );
    });
}
