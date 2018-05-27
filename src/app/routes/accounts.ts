/**
 * 口座ルーター
 */
// import * as sskts from '@motionpicture/sskts-domain';
// import * as createDebug from 'debug';
import { Router } from 'express';
// import { BAD_REQUEST, CREATED, FORBIDDEN, NOT_FOUND, TOO_MANY_REQUESTS, UNAUTHORIZED } from 'http-status';
// import * as moment from 'moment';

import authentication from '../middlewares/authentication';
// import permitScopes from '../middlewares/permitScopes';
// import validator from '../middlewares/validator';

const accountRouter = Router();

// const pecorinoAuthClient = new sskts.pecorinoapi.auth.ClientCredentials({
//     domain: <string>process.env.PECORINO_AUTHORIZE_SERVER_DOMAIN,
//     clientId: <string>process.env.PECORINO_API_CLIENT_ID,
//     clientSecret: <string>process.env.PECORINO_API_CLIENT_SECRET,
//     scopes: [],
//     state: ''
// });

accountRouter.use(authentication);

/**
 * 管理者として口座に入金する
 */
// accountRouter.post(
//     '/transactions/deposit',
//     permitScopes(['admin']),
//     validator,
//     async (req, res, next) => {
//         try {
//             const depositService = new sskts.pecorinoapi.service.transaction.Deposit({
//                 endpoint: <string>process.env.PECORINO_API_ENDPOINT,
//                 auth: pecorinoAuthClient
//             });
//             const transaction = await depositService.start({
//                 toAccountNumber: req.body.toAccountNumber,
//                 // tslint:disable-next-line:no-magic-numbers
//                 expires: moment().add(5, 'minutes').toDate(),
//                 agent: {
//                     typeOf: sskts.factory.personType.Person,
//                     id: req.user.sub,
//                     name: (req.user.username !== undefined) ? req.user.username : '',
//                     url: ''
//                 },
//                 recipient: {
//                     typeOf: sskts.factory.personType.Person,
//                     id: req.params.personId,
//                     name: '',
//                     url: ''
//                 },
//                 amount: req.body.amount,
//                 notes: (req.body.notes !== undefined) ? req.body.notes : 'シネマサンシャイン入金'
//             });
//             await depositService.confirm({ transactionId: transaction.id });
//             res.status(CREATED).json(transaction);
//         } catch (error) {
//             // PecorinoAPIのレスポンスステータスコードが4xxであればクライアントエラー
//             if (error.name === 'PecorinoRequestError') {
//                 // Pecorino APIのステータスコード4xxをハンドリング
//                 const message = `${error.name}:${error.message}`;
//                 switch (error.code) {
//                     case BAD_REQUEST: // 400
//                         error = new sskts.factory.errors.Argument('toAccountNumber', message);
//                         break;
//                     case UNAUTHORIZED: // 401
//                         error = new sskts.factory.errors.Unauthorized(message);
//                         break;
//                     case FORBIDDEN: // 403
//                         error = new sskts.factory.errors.Forbidden(message);
//                         break;
//                     case NOT_FOUND: // 404
//                         error = new sskts.factory.errors.NotFound(message);
//                         break;
//                     case TOO_MANY_REQUESTS: // 429
//                         error = new sskts.factory.errors.RateLimitExceeded(message);
//                         break;
//                     default:
//                         error = new sskts.factory.errors.ServiceUnavailable(message);
//                 }
//             }

//             next(error);
//         }
//     }
// );

export default accountRouter;
