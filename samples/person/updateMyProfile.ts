/**
 * プロフィール変更サンプル
 *
 * @ignore
 */

import * as createDebug from 'debug';

import * as sskts from '../lib/sskts-api';

const debug = createDebug('sskts-api:samples');

async function main() {
    const auth = new sskts.auth.GoogleToken(
        // tslint:disable-next-line:max-line-length
        'eyJhbGciOiJSUzI1NiIsImtpZCI6IjY3ODU2OGM4YWRiMmVjYzA3ZDE0M2RiNTE0Y2M3YTk5NTIwN2RmMzYifQ.eyJhenAiOiI5MzI5MzQzMjQ2NzEtNjZrYXN1am50ajJqYTdjNWs0azU1aWo2cGFrcHFpcjQuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI5MzI5MzQzMjQ2NzEtNjZrYXN1am50ajJqYTdjNWs0azU1aWo2cGFrcHFpcjQuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDgwMTczNzA5ODQ2NDQ2NDkyODgiLCJlbWFpbCI6Imlsb3ZlZ2FkZEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXRfaGFzaCI6IlpnSlRDT3o1TGxrM25IcjNIanBmV0EiLCJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiaWF0IjoxNTAxNDYzODk5LCJleHAiOjE1MDE0Njc0OTksIm5hbWUiOiJUZXRzdSBZYW1hemFraSIsInBpY3R1cmUiOiJodHRwczovL2xoNi5nb29nbGV1c2VyY29udGVudC5jb20vLVRpM29LMmwxNmJzL0FBQUFBQUFBQUFJL0FBQUFBQUFBNjNNL01Dc0JlWWNpWnpJL3M5Ni1jL3Bob3RvLmpwZyIsImdpdmVuX25hbWUiOiJUZXRzdSIsImZhbWlseV9uYW1lIjoiWWFtYXpha2kiLCJsb2NhbGUiOiJlbiJ9.uUt2S79e33NkwiHhJb7YoVAHO3x5ItG3pQbIVKn7RIHlFAehEqa8yPjEmYEDTbp355qGM4AaqMNgd8R8ersSlljyu2b1TLp-QaT6j7xlIPm-z9ynq-wwtuWcBcG7lFBaRuH7S1nsPeD7B1Lcn3_2Zevk7Ed4e2PtLHsP6We-M0lVDa6Bx7WFUZyB-5Bfv7xrR7je7tk31dZJi7sfA2B-CcnMvLasPoYuwoUdKDB9feUWkkCaHPe3iJC3_UPOWIhszqS7dzI_IuTL3sTSto7BxAEMJ9-Bx_BbDabYVFMjnevkyek6bSvaF_ZCJhw-Bf2VTjMENVj_8S-7RP87R4x8ew',
        'teststate',
        ['people.profile']
    );

    let profile = await sskts.service.person.getMyProfile({
        auth: auth
    });
    debug('profile is', profile);

    await sskts.service.person.updateMyProfile({
        auth: auth,
        profile: {
            givenName: 'めい',
            familyName: 'せい',
            telephone: '09012345678'
        }
    });
    debug('profile updated');

    profile = await sskts.service.person.getMyProfile({
        auth: auth
    });
    debug('profile is', profile);
}

main().then(() => {
    debug('main processed.');
}).catch((err) => {
    console.error(err);
});
