import * as sskts from '@motionpicture/sskts-domain';
import express = require('express');

declare global {
    namespace Express {
        export type IUser = sskts.factory.clientUser.IClientUser
        export interface Request {
            getUser: () => IUser;
            accessToken: string
        }
    }
}
