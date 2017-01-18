type AuthorizationGroup =
    "ASSET"
    | "COA_SEAT_RESERVATION"
    | "GMO"
    | "MVTK"
    ;

namespace AuthorizationGroup {
    /** 内部資産管理 */
    export const ASSET = "ASSET";
    /** COA座席予約資産管理 */
    export const COA_SEAT_RESERVATION = "COA_SEAT_RESERVATION";
    /** GMO資産管理 */
    export const GMO = "GMO";
    /** ムビチケ資産管理 */
    export const MVTK = "MVTK";
}

export default AuthorizationGroup;