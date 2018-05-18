
const request = require('request-promise-native');

const accessToken = process.env.TEST_ACCESS_TOKEN;

async function main() {
    let response = await request.post({
        url: `http://localhost:8081/people/me/accounts`,
        auth: { bearer: accessToken },
        json: true,
        simple: false,
        resolveWithFullResponse: true
    });
    console.log('account opened.', response.statusCode, response.body);
}

main().then(() => {
    console.log('success!');
}).catch(console.error)
