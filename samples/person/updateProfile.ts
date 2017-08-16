/**
 * プロフィール変更サンプル
 *
 * @ignore
 */

import * as createDebug from 'debug';

import * as sskts from '../lib/sskts-api';

const debug = createDebug('sskts-api:samples');

async function main() {
    // Googleから受け取ったid_tokenを使ってサインイン
    // tslint:disable-next-line:max-line-length
    const idToken = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjM4ZDNlMTNmY2ZkMGVhODI3YjU3MTk3ZjRkNjY1Y2VlNjBlYmY2YjAifQ.eyJhenAiOiI5MzI5MzQzMjQ2NzEtNjZrYXN1am50ajJqYTdjNWs0azU1aWo2cGFrcHFpcjQuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI5MzI5MzQzMjQ2NzEtNjZrYXN1am50ajJqYTdjNWs0azU1aWo2cGFrcHFpcjQuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDgwMTczNzA5ODQ2NDQ2NDkyODgiLCJlbWFpbCI6Imlsb3ZlZ2FkZEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXRfaGFzaCI6ImJqaDlZN0V6YW9ZUUZkNDdmUlAxRFEiLCJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiaWF0IjoxNTAxNjM4MTI4LCJleHAiOjE1MDE2NDE3MjgsIm5hbWUiOiJUZXRzdSBZYW1hemFraSIsInBpY3R1cmUiOiJodHRwczovL2xoNi5nb29nbGV1c2VyY29udGVudC5jb20vLVRpM29LMmwxNmJzL0FBQUFBQUFBQUFJL0FBQUFBQUFBNjNNL01Dc0JlWWNpWnpJL3M5Ni1jL3Bob3RvLmpwZyIsImdpdmVuX25hbWUiOiJUZXRzdSIsImZhbWlseV9uYW1lIjoiWWFtYXpha2kiLCJsb2NhbGUiOiJlbiJ9.TunuOKsXcJAvbP2bu1YNMg2Ffd0AGIe3a6QbGgh-AtXbmljXNRvIY4z4J8AIdgiUMNrnDpvTibi10y3Sk0zOtbJHZB8R4LJ9on3GjTtXa7Yx5JbfLACtHOsIKhzTiY76Ywy69kQHxrdYPjO2vO_O1q9fmmiHx0YwsBw4S3MlD0Ck-gDlVPwBGnvXsJdwNalbwv11nb5duPMxI97dDQjP-0GQT3Qj8PL5Erumu-LZ5KPgSNG1af81XNcQsiJbKI64Gjai5lDsZZVUNs2AA2SEU24CpeE5fFLx3LsPt3yiCT1WF2AH1cGYpK_8pzRovZBCPea3ibypDZmuguiWk0GGxQ';
    const auth = new sskts.auth.GoogleToken(
        idToken,
        'motionpicture',
        'teststate',
        ['https://sskts-api-development.azurewebsites.net/people.profile']
    );
    const credentials = await auth.refreshAccessToken();
    debug('credentials:', credentials);

    let profile = await sskts.service.person.getProfile({
        auth: auth,
        personId: 'me'
    });
    debug('profile is', profile);

    await sskts.service.person.updateProfile({
        auth: auth,
        personId: 'me',
        profile: {
            givenName: 'めい',
            familyName: 'せい',
            telephone: '09012345678',
            email: 'ilovegadd@gmail.com'
        }
    });
    debug('profile updated');

    profile = await sskts.service.person.getProfile({
        auth: auth,
        personId: 'me'
    });
    debug('profile is', profile);
}

main().then(() => {
    debug('main processed.');
}).catch((err) => {
    console.error(err);
});
