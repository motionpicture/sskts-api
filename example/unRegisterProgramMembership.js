
const request = require('request-promise-native');

const accessToken = process.env.TEST_ACCESS_TOKEN;

async function main() {
    let response = await request.put({
        url: `http://localhost:8081/people/me/ownershipInfos/programMembership/ProgramMembership-1527669098107/unRegister`,
        auth: { bearer: accessToken },
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        body: {}
    });
    console.log('task created.', response.statusCode, response.body);
}

main().then(() => {
    console.log('success!');
}).catch(console.error)
