/**
 * oauthコントローラー
 *
 * @namespace controllers/oauth
 */

import * as sskts from '@motionpicture/sskts-domain';
import * as createDebug from 'debug';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';

const debug = createDebug('sskts-api:controllers:oauth');
// todo どこで定義するか
const ACCESS_TOKEN_EXPIRES_IN_SECONDS = 1800;

export const MESSAGE_UNIMPLEMENTED_GRANT_TYPE = 'grant_type not implemented';
export const MESSAGE_CLIENT_NOT_FOUND = 'client not found';
export const MESSAGE_INVALID_USERNAME_OR_PASSWORD = 'invalid username or password';
export const MESSAGE_INVALID_ASSERTION = 'client not foundinvalid assertion';

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
            return await issueCredentialsByClient(req.body.client_id, req.body.state, req.body.scopes);

        case 'password':
            return await issueCredentialsByPassword(
                req.body.client_id, req.body.state, req.body.username, req.body.password, req.body.scopes
            );

        default:
            // 非対応認可タイプ
            throw new Error(MESSAGE_UNIMPLEMENTED_GRANT_TYPE);
    }
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
        throw new Error(MESSAGE_INVALID_ASSERTION);
    }

    // todo clientとstateどうするか
    const payload = sskts.factory.clientUser.create({
        client: '',
        state: '',
        scopes: scopes
    });

    return await payload2credentials(payload);
}

/**
 * クライアントIDから資格情報を発行する
 *
 * @param {string} clientId クライアントID
 * @param {string[]} scopes スコープリスト
 * @returns {Promise<ICredentials>} 資格情報
 */
export async function issueCredentialsByClient(clientId: string, state: string, scopes: string[]): Promise<ICredentials> {
    // クライアントの存在確認
    const clientAdapter = sskts.adapter.client(sskts.mongoose.connection);
    const clientDoc = await clientAdapter.clientModel.findById(clientId, '_id').exec();
    if (clientDoc === null) {
        throw new Error(MESSAGE_CLIENT_NOT_FOUND);
    }

    const payload = sskts.factory.clientUser.create({
        client: clientId,
        state: state,
        scopes: scopes
    });

    return await payload2credentials(payload);
}

export async function issueCredentialsByPassword(
    clientId: string, state: string, username: string, password: string, scopes: string[]
): Promise<ICredentials> {
    // クライアントの存在確認
    const clientAdapter = sskts.adapter.client(sskts.mongoose.connection);
    const clientDoc = await clientAdapter.clientModel.findById(clientId, '_id').exec();
    if (clientDoc === null) {
        throw new Error(MESSAGE_CLIENT_NOT_FOUND);
    }

    // ログイン確認
    const ownerAdapter = sskts.adapter.owner(sskts.mongoose.connection);
    const memberOption = await sskts.service.member.login(username, password)(ownerAdapter);
    if (memberOption.isEmpty) {
        throw new Error(MESSAGE_INVALID_USERNAME_OR_PASSWORD);
    }

    const owner = memberOption.get();
    const payload = sskts.factory.clientUser.create({
        client: clientId,
        state: state,
        owner: owner.id,
        scopes: scopes
    });

    return await payload2credentials(payload);
}

/**
 * 任意のデータをJWTを使用して資格情報へ変換する
 *
 * @param {object} payload 変換したいデータ
 * @returns {Promise<ICredentials>} 資格情報
 */
export async function payload2credentials(payload: Express.IUser): Promise<ICredentials> {
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
