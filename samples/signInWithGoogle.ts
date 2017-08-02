/**
 * Googleでサインインサンプル
 *
 * @ignore
 */

import * as createDebug from 'debug';

import * as sskts from './lib/sskts-api';

const debug = createDebug('sskts-api:samples');

async function main() {
    // Googleから受け取ったid_tokenを使ってサインイン
    // tslint:disable-next-line:max-line-length
    const idToken = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjM4ZDNlMTNmY2ZkMGVhODI3YjU3MTk3ZjRkNjY1Y2VlNjBlYmY2YjAifQ.eyJhenAiOiI5MzI5MzQzMjQ2NzEtNjZrYXN1am50ajJqYTdjNWs0azU1aWo2cGFrcHFpcjQuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI5MzI5MzQzMjQ2NzEtNjZrYXN1am50ajJqYTdjNWs0azU1aWo2cGFrcHFpcjQuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDgwMTczNzA5ODQ2NDQ2NDkyODgiLCJlbWFpbCI6Imlsb3ZlZ2FkZEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXRfaGFzaCI6Ik5zSEFDOHJnb3J2ZGRTUXZWcWdfVUEiLCJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiaWF0IjoxNTAxNjM0MTI5LCJleHAiOjE1MDE2Mzc3MjksIm5hbWUiOiJUZXRzdSBZYW1hemFraSIsInBpY3R1cmUiOiJodHRwczovL2xoNi5nb29nbGV1c2VyY29udGVudC5jb20vLVRpM29LMmwxNmJzL0FBQUFBQUFBQUFJL0FBQUFBQUFBNjNNL01Dc0JlWWNpWnpJL3M5Ni1jL3Bob3RvLmpwZyIsImdpdmVuX25hbWUiOiJUZXRzdSIsImZhbWlseV9uYW1lIjoiWWFtYXpha2kiLCJsb2NhbGUiOiJlbiJ9.E1T-q1TfYw1DhAD9G6u4rwr0EpPHN_O9sMiezVcBICiHOsmQl46WR6Fxe38QjD_iAtE8wp5ytmKqkJMQFeKl-vmQvIQ5Owv2QhrQsmPpBw8HdCwoh0Y6hVW76TSJXaKAA7qxwhzD-oxLCguy2l6odsl5yYbc2WwJ8Nek4FnVkTLweav9ZqiLXkYzMmNoKWkfQ6ZVUfuHDS-yp0dHCA6jEI6Nd5o9p1XAScpkfoK0eXc48h4mUxXzh73RppqbWzPtSmTOT2ISy-yd7Xu5KOiruu-vlc5quuGmrdkIb6yVL1SFji6Bw7CfwLS8WBHZmaR3YH0VJjXhVGTgeqFUkMNSSQ';
    const auth = new sskts.auth.GoogleToken(
        idToken,
        'motionpicture',
        'teststate',
        ['people.profile']
    );
    const credentials = await auth.refreshAccessToken();
    debug('credentials:', credentials);

    const accessToken = await auth.getAccessToken();
    debug('accessToken is', accessToken);
}

main().then(() => {
    debug('main processed.');
}).catch((err) => {
    console.error(err);
});
