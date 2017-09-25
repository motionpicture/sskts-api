/**
 * oauthミドルウェア
 * @module middlewares/authentication
 * @see https://aws.amazon.com/blogs/mobile/integrating-amazon-cognito-user-pools-with-api-gateway/
 */

import * as sskts from '@motionpicture/sskts-domain';
import * as createDebug from 'debug';
import { NextFunction, Request, Response } from 'express';
// import * as jwt from 'express-jwt';
// import * as fs from 'fs';
import * as jwt from 'jsonwebtoken';
// tslint:disable-next-line:no-require-imports no-var-requires
const jwkToPem = require('jwk-to-pem');
import * as request from 'request-promise-native';

const debug = createDebug('sskts-api:middlewares:authentication');

export interface IOpenIdConfiguration {
    issuer: string;
    authorization_endpoint: string;
    token_endpoint: string;
    jwks_uri: string;
    response_types_supported: string[];
    subject_types_supported: string[];
    version: string;
    id_token_signing_alg_values_supported: string[];
    x509_url: string;
}

export interface IPayload {
    sub: string;
    token_use: string;
    scope: string;
    iss: string;
    exp: number;
    iat: number;
    version: number;
    jti: string;
    client_id: string;
    username?: string;
}

export interface IPems {
    [key: string]: string;
}

export interface IJwk {
    kty: string;
    alg: string;
    use: string;
    kid: string;
    n: string;
    e: string;
}

const ISSUER = process.env.TOKEN_ISSUER;
// const permittedAudiences = [
//     '4flh35hcir4jl73s3puf7prljq',
//     '6figun12gcdtlj9e53p2u3oqvl'
// ];

// tslint:disable-next-line:no-require-imports no-var-requires
// const pemsFromJson: IPems = require('../../../certificate/pems.json');

export default async (req: Request, __: Response, next: NextFunction) => {
    try {
        let token: string | null = null;
        if (typeof req.headers.authorization === 'string' && (<string>req.headers.authorization).split(' ')[0] === 'Bearer') {
            token = (<string>req.headers.authorization).split(' ')[1];
        }

        if (token === null) {
            throw new Error('authorization required');
        }

        const pems: IPems = await createPems();
        const payload = await validateToken(pems, token);
        debug('verified! payload:', payload);
        req.user = {
            ...payload,
            ...{
                // アクセストークンにはscopeとして定義されているので、scopesに変換
                scopes: (typeof payload.scope === 'string') ? (<string>payload.scope).split((' ')) : []
            }
        };
        req.accessToken = token;

        next();
    } catch (error) {
        next(new sskts.factory.errors.Unauthorized(error.message));
    }
};

export async function createPems() {
    const openidConfiguration: IOpenIdConfiguration = await request({
        url: `${ISSUER}/.well-known/openid-configuration`,
        json: true
    }).then((body) => body);

    return await request({
        url: openidConfiguration.jwks_uri,
        json: true
    }).then((body) => {
        debug('got jwks_uri', body);
        const pemsByKid: IPems = {};
        (<any[]>body.keys).forEach((key) => {
            pemsByKid[key.kid] = jwkToPem(key);
        });

        return pemsByKid;
    });

    // await fs.writeFile(`${__dirname}/pems.json`, JSON.stringify(pems));
}

export async function validateToken(pems: IPems, token: string): Promise<IPayload> {
    debug('validating token...', pems, token);
    const decodedJwt = <any>jwt.decode(token, { complete: true });
    if (!decodedJwt) {
        throw new Error('invalid JWT token');
    }
    debug('decodedJwt:', decodedJwt);

    // if (decodedJwt.payload.aud !== AUDIENCE) {
    //     throw new Error('invalid audience');
    // }

    // Reject the jwt if it's not an 'Access Token'
    if (decodedJwt.payload.token_use !== 'access') {
        throw new Error('not an access token');
    }

    // Get the kid from the token and retrieve corresponding PEM
    const pem = pems[decodedJwt.header.kid];
    if (pem === undefined) {
        throw new Error(`corresponding pem undefined. kid:${decodedJwt.header.kid}`);
    }

    return new Promise<IPayload>((resolve, reject) => {
        // Verify the signature of the JWT token to ensure it's really coming from your User Pool
        jwt.verify(
            token,
            pem,
            {
                issuer: ISSUER
                // audience: pemittedAudiences
            },
            (err, payload) => {
                if (err !== null) {
                    reject(err);
                } else {
                    // Always generate the policy on value of 'sub' claim and not for 'username' because username is reassignable
                    // sub is UUID for a user which is never reassigned to another user
                    resolve(<IPayload>payload);
                }
            });
    });
}
