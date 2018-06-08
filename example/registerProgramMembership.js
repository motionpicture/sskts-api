
const request = require('request-promise-native');

const accessToken = process.env.TEST_ACCESS_TOKEN;

async function main() {
    let response = await request.put({
        url: `http://localhost:8081/people/me/ownershipInfos/programMembership/register`,
        auth: { bearer: accessToken },
        json: true,
        simple: false,
        resolveWithFullResponse: true,
        body: {
            programMembershipId: '5afff104d51e59232c7b481b',
            offerIdentifier: 'AnnualPlan',
            sellerType: 'MovieTheater',
            sellerId: '59d20831e53ebc2b4e774466'
        }
    });
    console.log('task created.', response.statusCode, response.body);
}

main().then(() => {
    console.log('success!');
}).catch(console.error)
