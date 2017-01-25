import Owner from "../model/owner";
import AnonymousOwner from "../model/owner/anonymous";
import AdministratorOwner from "../model/owner/administrator";
import OwnerGroup from "../model/ownerGroup";
import MultilingualString from "../model/multilingualString";

export function create(args: {
    _id: string,
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
    _id: string,
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
    _id: string,
    name?: MultilingualString,
}): AdministratorOwner {
    return new AdministratorOwner(
        args._id,
        (args.name) ? args.name : {ja: "", en: ""},
    );
}