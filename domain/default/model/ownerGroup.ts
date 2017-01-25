type OwnerGroup =
    "ANONYMOUS"
    | "ADMINISTRATOR"
    | "MEMBER"
    ;

namespace OwnerGroup {
    /** 匿名グループ */
    export const ANONYMOUS = "ANONYMOUS";
    /** 運営者グループ */
    export const ADMINISTRATOR = "ADMINISTRATOR";
    /** 会員グループ */
    export const MEMBER = "MEMBER";
}

export default OwnerGroup;