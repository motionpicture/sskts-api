// 承認サービス
interface AuthorizationService {
    settle(): Promise<void>;
    cancel(): Promise<void>;
}

export default AuthorizationService;