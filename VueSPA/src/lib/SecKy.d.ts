export interface SecKyOptions {
    authToken: string | undefined;
    baseUrl: string | undefined;
    policy: RetryPolicy | undefined;
    reauthAction: () => Promise<RefreshTokenResult> | undefined;
}
export declare type ResultType = RequestError | RequestResult;
interface RefreshTokenResult {
    success: boolean;
    token?: string;
    refreshToken?: string;
    tokenExpires?: Date;
    refreshTokenExpires?: Date;
}
declare class RequestError {
    success: boolean;
    status: number;
    statusText: string;
    error: string;
    constructor(status: number, statusText: string, error: string);
}
declare type SupportedPayloadType = object | Blob | string;
declare class RequestResult {
    success: boolean;
    status: number;
    payload: SupportedPayloadType | undefined;
    constructor(success: boolean, status: number, payload: SupportedPayloadType | undefined);
}
export declare enum BasicExecutionPolicy {
    NoRetry = 0,
    RetryOnce = 1,
    RetryForever = 2
}
interface PolicyOptions {
    timesBeforeThrow: number;
    shouldRetry: boolean;
    timeout: number | undefined;
}
export declare class RetryPolicy {
    timesBeforeThrow: number;
    shouldRetry: boolean;
    timeout: number;
    static createBasic(basicPolicy: BasicExecutionPolicy): RetryPolicy;
    constructor(options: PolicyOptions);
}
/**Handy wrapper for ky - fetch api wrapper. LOL
 * Provides in-built functionality for making nice requests to spa's backend API.
 *
 *
 * */
export declare class SecKy {
    private _authToken;
    private _refreshToken;
    private _baseUrl;
    private _policy;
    private _reauthAction;
    set retryPolicy(retryPolicy: RetryPolicy);
    private getRequestOptions;
    private getResultOrError;
    private execWithRetryOn401;
    constructor(options?: SecKyOptions);
    get(url: string, object: object | undefined, withToken: boolean | undefined): Promise<ResultType>;
    post(url: string, object: object | undefined, withToken: boolean | undefined): Promise<ResultType>;
    put(url: string, object: object | undefined, withToken: boolean | undefined): Promise<ResultType>;
    delete(url: string, object: object | undefined, withToken: boolean | undefined): Promise<ResultType>;
}
/** Instance of SecKy class - wrapper for js fetch api wrapper - ky.
 * Provides versarile experience with handling requests for the application's api.
 * Handles requests of types get, post, put, delete and is capable of reauthorizing user with reapplying tokens and claims to
 * user store
 *
 *
 * */
export declare let SecKyInstance: SecKy;
/**
 * Global constructor, initializing instance of SecKyInstance.
 * Requires SecKyOptions to be provided.
 */
export declare const createSecKyInstance: (options: SecKyOptions) => void;
export {};
