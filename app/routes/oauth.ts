/**
 * oauthルーター
 *
 * @ignore
 */

import * as sskts from '@motionpicture/sskts-domain';
import * as createDebug from 'debug';
import * as express from 'express';

// tslint:disable-next-line:no-require-imports no-var-requires
const googleAuth = require('google-auth-library');

const oauthRouter = express.Router();

import * as oauthController from '../controllers/oauth';
import validator from '../middlewares/validator';

const debug = createDebug('sskts-api:routes:oauth');

oauthRouter.post(
    '/token',
    (req, _, next) => {
        // 認可タイプ未指定であれば強制的にJWT Bearer Tokenタイプに
        // if (typeof req.body.grant_type !== 'string') {
        //     req.body.grant_type = 'urn:ietf:params:oauth:grant-type:jwt-bearer';
        // }

        // req.checkBody('scope', 'invalid scope').optional().notEmpty().withMessage('scope is required')
        //     .equals('admin');

        // スコープ指定があれば配列に変換
        // スコープ指定は当初「admin」のみ受け付けていたので、これで互換性が保たれる
        // if (req.body.scope === 'admin') {
        //     req.body.scopes = ['admin'];
        // }

        req.checkBody('scopes', 'invalid scopes').notEmpty().withMessage('scopes is required');

        // 認可タイプによってチェック項目が異なる
        switch (req.body.grant_type) {
            // case 'urn:ietf:params:oauth:grant-type:jwt-bearer':
            //     req.checkBody('assertion', 'invalid assertion').notEmpty().withMessage('assertion is required');
            //     break;

            case 'client_credentials':
                req.checkBody('client_id', 'invalid client_id').notEmpty().withMessage('client_id is required');
                req.checkBody('state', 'invalid state').notEmpty().withMessage('state is required');
                break;

            // case 'password':
            //     req.checkBody('client_id', 'invalid client_id').notEmpty().withMessage('client_id is required');
            //     req.checkBody('state', 'invalid state').notEmpty().withMessage('state is required');
            //     req.checkBody('username', 'invalid username').notEmpty().withMessage('username is required');
            //     req.checkBody('password', 'invalid password').notEmpty().withMessage('password is required');
            //     break;

            default:
        }

        next();
    },
    validator,
    async (req, res, next) => {
        try {
            // 資格情報を発行する
            const credentials = await oauthController.issueCredentials(req);
            res.json(credentials);
        } catch (error) {
            next(error);
        }
    }
);

oauthRouter.post(
    '/token/signInWithGoogle',
    validator,
    // tslint:disable-next-line:max-func-body-length
    async (req, res, next) => {
        try {

            // 資格情報を発行する
            // const credentials = await oauthController.payload2credentials(<any>{
            //     person: {
            //         id: '12345'
            //     },
            //     state: req.body.state,
            //     scopes: req.body.scopes
            // });
            // res.json(credentials);

            async function verifyIdToken(idToken: string) {
                return new Promise<any>((resolve, reject) => {

                    // idTokenをGoogleで検証
                    const CLIENT_ID = '932934324671-66kasujntj2ja7c5k4k55ij6pakpqir4.apps.googleusercontent.com';
                    const auth = new googleAuth();
                    const client = new auth.OAuth2(CLIENT_ID, '', '');
                    client.verifyIdToken(
                        idToken,
                        CLIENT_ID,
                        // Or, if multiple clients access the backend:
                        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3],
                        async (error: any, login: any) => {
                            if (error !== null) {
                                reject(error);

                                return;
                            }

                            // todo audのチェック

                            const payload = login.getPayload();
                            debug('payload is', payload);

                            // const userId = payload.sub;
                            // If request specified a G Suite domain:
                            //var domain = payload['hd'];

                            resolve(payload);
                        });
                });
            }

            const userInfo = await verifyIdToken(req.body.idToken);

            // 会員検索(なければ登録)
            const personAdapter = await sskts.adapter.person(sskts.mongoose.connection);
            const person = {
                typeOf: 'Person',
                email: userInfo.email,
                givenName: '',
                familyName: '',
                telephone: '',
                memberOf: {
                    openId: {
                        provider: userInfo.iss,
                        userId: userInfo.sub
                    },
                    hostingOrganization: {},
                    membershipNumber: `${userInfo.iss}-${userInfo.sub}`,
                    programName: 'シネマサンシャインプレミアム'
                }
            };
            const personDoc = await personAdapter.personModel.findOneAndUpdate(
                {
                    'memberOf.openId.provider': person.memberOf.openId.provider,
                    'memberOf.openId.userId': person.memberOf.openId.userId
                },
                {
                    $setOnInsert: person // 新規の場合のみ更新
                },
                {
                    new: true, upsert: true
                }
            ).exec();

            if (personDoc === null) {
                throw new Error('member not found');
            }

            // 資格情報を発行する
            const credentials = await oauthController.payload2credentials(<any>{
                person: personDoc.toObject(),
                state: req.body.state,
                scopes: req.body.scopes
            });
            res.json(credentials);
        } catch (error) {
            next(error);
        }
    }
);

export default oauthRouter;
