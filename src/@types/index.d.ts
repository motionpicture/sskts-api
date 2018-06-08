/**
 * middlewares/authenticationにて、expressのrequestオブジェクトにAPIユーザー情報を追加している。
 * ユーザーの型をここで定義しています。
 * @ignore
 */
import * as sskts from '@motionpicture/sskts-domain';
import * as express from 'express';

declare global {
    namespace Express {
        export type IUser = sskts.factory.clientUser.IClientUser;

        // tslint:disable-next-line:interface-name
        export interface Request {
            agent: sskts.factory.person.IPerson;
            user: IUser;
            accessToken: string;
        }
    }
}
