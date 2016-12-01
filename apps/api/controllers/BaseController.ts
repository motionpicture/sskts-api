import log4js = require('log4js');

/**
 * ベースコントローラー
 */
export class BaseController {
    /** ロガー */
    protected logger: log4js.Logger;

    constructor() {
        this.logger = log4js.getLogger('system');
    }
}
