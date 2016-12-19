/**
 * スクリーン検索
 */
// @Get("/screens")
// find(@QueryParam("theater_code") theaterCode: string) {
//     let screens: Array<{
//         screen_code: string,
//         screen_name: string,
//         screen_name_eng: string,
//         list_seat: Array<{
//             seat_num: string,
//             flg_special: string,
//             flg_hc: string,
//             flg_pair: string,
//             flg_free: string,
//             flg_spare: string
//         }>
//     }> = [];
//     return new Promise((resolve, reject) => {
//         this.publishAccessToken((err, accessToken) => {
//             if (err) return reject(err);
//             request.get({
//                 url: `${config.get<string>("coa_api_endpoint")}/api/v1/theater/${theaterCode}/screen/`,
//                 auth: {bearer: accessToken},
//                 json: true
//             }, (error, response, body) => {
//                 if (error) return reject(error);
//                 if (typeof body === "string")  return reject(new Error(body));
//                 if (body.message) return reject(new Error(body.message));
//                 if (body.status !== 0) return reject(new Error(body.status));
//                 resolve(body.list_screen);
//             });
//         });
//     }).then((results: typeof screens) => {
//         return {
//             success: true,
//             screens: results
//         };
//     }, (err) => {
//         return {
//             success: false,
//             message: err.message,
//         }
//     });
// }
