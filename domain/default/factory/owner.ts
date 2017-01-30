import ObjectId from "../model/objectId";
import Owner from "../model/owner";
import AnonymousOwner from "../model/owner/anonymous";
import PromoterOwner from "../model/owner/promoter";
import OwnerGroup from "../model/ownerGroup";
import MultilingualString from "../model/multilingualString";

export function create(args: {
    _id: ObjectId,
    group: OwnerGroup,
}) {
    return new Owner(
        args._id,
        args.group,
    );
}

/**
 * 一般所有者を作成する
 * IDは、メソッドを使用する側で事前に作成する想定
 * 確実にAnonymousOwnerモデルを作成する責任を持つ
 */
export function createAnonymous(args: {
    _id: ObjectId,
    name_first?: string,
    name_last?: string,
    email?: string,
    tel?: string,
}): AnonymousOwner {
    return new AnonymousOwner(
        args._id,
        (args.name_first) ? args.name_first : "",
        (args.name_last) ? args.name_last : "",
        (args.email) ? args.email : "",
        (args.tel) ? args.tel : "",
    );
}

export function createAdministrator(args: {
    _id: ObjectId,
    name?: MultilingualString,
}): PromoterOwner {
    return new PromoterOwner(
        args._id,
        (args.name) ? args.name : {ja: "", en: ""},
    );
}