import ky from 'ky';
// @ts-ignore
import { HttpStatusCode } from './HttpStatusCode';
class RequestError {
    success = false;
    status;
    statusText;
    error;
    constructor(status, statusText, error) {
        this.status = status;
        this.statusText = statusText;
        this.error = error;
    }
}
class RequestResult {
    success = true;
    status;
    payload;
    constructor(success, status, payload) {
        this.success = success;
        this.status = status;
        this.payload = payload;
    }
}
export var BasicExecutionPolicy;
(function (BasicExecutionPolicy) {
    BasicExecutionPolicy[BasicExecutionPolicy["NoRetry"] = 0] = "NoRetry";
    BasicExecutionPolicy[BasicExecutionPolicy["RetryOnce"] = 1] = "RetryOnce";
    BasicExecutionPolicy[BasicExecutionPolicy["RetryForever"] = 2] = "RetryForever";
})(BasicExecutionPolicy || (BasicExecutionPolicy = {}));
export class RetryPolicy {
    timesBeforeThrow;
    shouldRetry;
    timeout = 60000;
    static createBasic(basicPolicy) {
        switch (basicPolicy) {
            case BasicExecutionPolicy.RetryOnce:
                return new RetryPolicy({ shouldRetry: true, timesBeforeThrow: 1, timeout: 120000 });
            case BasicExecutionPolicy.RetryForever:
                return new RetryPolicy({ shouldRetry: true, timesBeforeThrow: Number.POSITIVE_INFINITY, timeout: Number.MAX_SAFE_INTEGER });
            case BasicExecutionPolicy.NoRetry:
            default:
                return new RetryPolicy({ shouldRetry: false, timesBeforeThrow: 0, timeout: 120000 });
        }
    }
    constructor(options) {
        if (!options) {
            throw new Error("Cannot create policy without options!");
        }
        this.timesBeforeThrow = options.timesBeforeThrow;
        this.shouldRetry = options.shouldRetry;
        this.timeout = options.timeout ?? 60000;
    }
}
/**Handy wrapper for ky - fetch api wrapper. LOL
 * Provides in-built functionality for making nice requests to spa's backend API.
 *
 *
 * */
export class SecKy {
    _authToken;
    _refreshToken;
    _baseUrl;
    _policy;
    _reauthAction;
    set retryPolicy(retryPolicy) {
        if (retryPolicy == null)
            throw new Error('Argument "retryPolicy" cannot be null');
        this._policy = retryPolicy;
    }
    getRequestOptions(withToken) {
        const options = {
            // { json: object, headers: this.getAuthHeader(),  }
            timeout: this._policy.timeout,
            retry: {},
            prefixUrl: '',
            headers: {
                Authorization: ''
            }
        };
        if (this._baseUrl)
            options.prefixUrl = this._baseUrl;
        if (this._authToken && withToken)
            options.headers.Authorization = `Bearer ${this._authToken}`;
        if (this._policy.shouldRetry) {
            options.retry = this._policy.timesBeforeThrow;
        }
        return options;
    }
    async getResultOrError(response) {
        let val = '';
        let err = '';
        const type = response.headers.get('content-type') ?? '';
        if (type.includes("application/json")) {
            try {
                val = await response.json();
            }
            catch (e) {
                err += '\n' + e;
            }
        }
        else if (type.includes("text")) {
            try {
                val = await response.text();
            }
            catch (e) {
                err += '\n' + e;
            }
        }
        else if (type.includes("application/octet-stream")) {
            try {
                val = await response.blob();
            }
            catch (e) {
                err += '\n' + e;
            }
        }
        else {
            err += `\nUnsupported content-type header: ${type}`;
        }
        if (!response.ok || err) {
            return new RequestError(response.status, response.statusText, val + '\n' + err);
        }
        let successTrueOrEmpty = false;
        if (!(val instanceof Object)) {
            successTrueOrEmpty = true;
        }
        else {
            var v = val;
            successTrueOrEmpty = !v || v.success;
        }
        return new RequestResult(response.ok && !err && successTrueOrEmpty, response.status, val);
    }
    async execWithRetryOn401(request, url, options) {
        let response = await request(url, options);
        if (!response.ok && response.status == HttpStatusCode.UNAUTHORIZED) {
            if (this._reauthAction == undefined) {
                throw new Error("[Argument not passed] Reauthentication action is not set up. ");
            }
            await this._reauthAction();
            response = await request(url, options);
        }
        return response;
    }
    constructor(options) {
        if (options) {
            this._authToken = options.authToken || undefined;
            this._baseUrl = options.authToken || undefined;
            this._reauthAction = options.reauthAction;
        }
        this._reauthAction = undefined;
        this._policy = options && options.policy || RetryPolicy.createBasic(BasicExecutionPolicy.NoRetry);
    }
    async get(url, object, withToken) {
        const options = this.getRequestOptions(withToken);
        var response = await this.execWithRetryOn401(ky.get, url, { ...options, json: object });
        var result = this.getResultOrError(response);
        return result;
    }
    async post(url, object, withToken) {
        const options = this.getRequestOptions(withToken);
        var response = await this.execWithRetryOn401(ky.post, url, { ...options, json: object });
        var result = this.getResultOrError(response);
        return result;
    }
    async put(url, object, withToken) {
        const options = this.getRequestOptions(withToken);
        var response = await this.execWithRetryOn401(ky.put, url, { ...options, json: object });
        var result = this.getResultOrError(response);
        return result;
    }
    async delete(url, object, withToken) {
        const options = this.getRequestOptions(withToken);
        var response = await this.execWithRetryOn401(ky.delete, url, { ...options, json: object });
        var result = this.getResultOrError(response);
        return result;
    }
}
/** Instance of SecKy class - wrapper for js fetch api wrapper - ky.
 * Provides versarile experience with handling requests for the application's api.
 * Handles requests of types get, post, put, delete and is capable of reauthorizing user with reapplying tokens and claims to
 * user store
 *
 *
 * */
export let SecKyInstance;
/**
 * Global constructor, initializing instance of SecKyInstance.
 * Requires SecKyOptions to be provided.
 */
export const createSecKyInstance = (options) => {
    SecKyInstance = new SecKy(options);
};
