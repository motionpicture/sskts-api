import express = require('express');

declare global {
    namespace Express {
        interface IClient {
            id: string;
            username: string;
        }
        interface IOwner {
            id: string;
            username: string;
        }
        interface IUser {
            client?: IClient,
            state?: string;
            owner?: IOwner,
            scopes: string[];
        }
        export interface Request {
            getUser: () => IUser;
        }
    }
}
