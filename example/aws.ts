/**
 * samples using AWS SDK
 */

import * as AWS from 'aws-sdk';

// tslint:disable-next-line:max-line-length
const accessToken = 'eyJraWQiOiJuMHR3RkZwaU54anh3ekZ5YzF6TVEzaWhNWmtJWDdLYWJHZnJOeVNyanFFPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJiZDE0ZDMwNy0wMWQ1LTQzMTEtYmYwMy1mNmQ4ZTdmNDM4MGUiLCJ0b2tlbl91c2UiOiJhY2Nlc3MiLCJzY29wZSI6ImF3cy5jb2duaXRvLnNpZ25pbi51c2VyLmFkbWluIHBob25lIG9wZW5pZCBwcm9maWxlIGVtYWlsIiwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLmFwLW5vcnRoZWFzdC0xLmFtYXpvbmF3cy5jb21cL2FwLW5vcnRoZWFzdC0xX3Rlb2dPdlNneiIsImV4cCI6MTUwMzMwMDI2OCwiaWF0IjoxNTAzMjk2NjY4LCJ2ZXJzaW9uIjoyLCJqdGkiOiJjNjdmZThjOS1iMThlLTRlZTItYTEwNC1iY2I1ZDFjMDg4ZGEiLCJjbGllbnRfaWQiOiJkbjJzbTM0YjZpbGkzNm1majRjOGE3azU0IiwidXNlcm5hbWUiOiJpbG92ZWdhZGRAZ21haWwuY29tIn0.CReYIPHXvogEboVYoJ4hCM3xdeEt98pEhSx4Ix6SxywrcxxQinDhrXAy8XeDd3JjSmberUOZ9ux7bqLApqSyJzfdWoBDp34UMKnUOL_NsqapDw9DBaoObpSg8A2pnKaRcbJQIXkvVp3fGFNTrzCFZXh1sIEJYVpb7aXHiQwsI_6XAci6met2_wxqEdIsTymNLTD2r5GkTNYmCfPT8zpyHGOjJrpmc9miQL-6y3rMKSSAQpLZADKpN7ZqK3wyBM2kFaFRkgxLf1DHM-syOnRcibWn0mTXwxePnH-R5gFoCpr7lVpOlVWsFosVBqz3V7M2qo7lPl44whH6Y5ATCqPxRg'

const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({
    apiVersion: 'latest',
    region: 'ap-northeast-1'
});

cognitoIdentityServiceProvider.getUser(
    {
        AccessToken: accessToken
    },
    (err, data) => {
        if (err instanceof Error) {
            console.error(err);
        } else {
            // tslint:disable-next-line:no-console
            console.log(data);
        }
    });

cognitoIdentityServiceProvider.updateUserAttributes(
    {
        AccessToken: accessToken,
        UserAttributes: [
            {
                Name: 'given_name',
                Value: 'めい'
            },
            {
                Name: 'family_name',
                Value: 'せい'
            },
            {
                Name: 'phone_number',
                Value: '+09012345678'
            }
        ]
    },
    (err, data) => {
        if (err instanceof Error) {
            console.error(err);
        } else {
            // tslint:disable-next-line:no-console
            console.log(data);
        }
    });
