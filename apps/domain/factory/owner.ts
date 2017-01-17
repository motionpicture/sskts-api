import * as Owner from "../model/Owner";

/**
 * 一般所有者を作成する
 * IDは、メソッドを使用する側で事前に作成する想定
 * 確実にAnonymousOwnerモデルを作成する責任を持つ
 */
export function createAnonymous(args: {
    _id: string,
    name_first?: string,
    name_last?: string,
    email?: string,
    tel?: string,
}): Owner.Anonymous {
    return new Owner.Anonymous(
        args._id,
        (args.name_first) ? args.name_first : "",
        (args.name_last) ? args.name_last : "",
        (args.email) ? args.email : "",
        (args.tel) ? args.tel : "",
    );
}