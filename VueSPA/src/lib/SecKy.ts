import ky, { KyResponse, Options, ResponsePromise } from 'ky';
// @ts-ignore
import { HttpStatusCode } from './HttpStatusCode'

export interface SecKyOptions {
  authToken: string | undefined;
  baseUrl: string | undefined;
  policy: RetryPolicy | undefined;
  reauthAction: () => Promise<RefreshTokenResult> | undefined;
}

export type ResultType = RequestError | RequestResult;

interface RefreshTokenResult {
  success: boolean,
  token?: string,
  refreshToken?: string,
  tokenExpires?: Date,
  refreshTokenExpires?: Date,
}

class RequestError {
  success: boolean = false;
  status: number;
  statusText: string;
  error: string;

  constructor(status: number, statusText: string, error: string) {
    this.status = status;
    this.statusText = statusText;
    this.error = error;
  }
}

type SupportedPayloadType = object | Blob | string;

class RequestResult {
  success: boolean = true;
  status: number;
  payload: SupportedPayloadType | undefined;

  constructor(success: boolean, status: number, payload: SupportedPayloadType | undefined) {
    this.success = success;
    this.status = status;
    this.payload = payload;
  }
}

export enum BasicExecutionPolicy {
  NoRetry,
  RetryOnce,
  RetryForever
}

interface PolicyOptions {
  timesBeforeThrow: number;
  shouldRetry: boolean;
  timeout: number | undefined;
}

export class RetryPolicy {
  timesBeforeThrow: number;
  shouldRetry: boolean;
  timeout: number = 60000;

  static createBasic(basicPolicy: BasicExecutionPolicy) {
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

  constructor(options: PolicyOptions) {
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
  private _authToken: string | undefined;
  private _refreshToken: string | undefined;
  private _baseUrl: string | undefined;
  private _policy: RetryPolicy;
  private _reauthAction: () => Promise<RefreshTokenResult> | undefined;

  set retryPolicy(retryPolicy: RetryPolicy) {
    if (retryPolicy == null) throw new Error('Argument "retryPolicy" cannot be null');
    this._policy = retryPolicy;
  }

  private getRequestOptions(withToken: boolean | undefined): Options {
    const options = {
      // { json: object, headers: this.getAuthHeader(),  }
      timeout: this._policy.timeout,
      retry: {},
      prefixUrl: '',
      headers: {
        Authorization: ''
      }
    }

    if (this._baseUrl)
      options.prefixUrl = this._baseUrl;

    if (this._authToken && withToken)
      options.headers.Authorization = `Bearer ${this._authToken}`;

    if (this._policy.shouldRetry) {
      options.retry = this._policy.timesBeforeThrow;
    }

    return options;
  }

  private async getResultOrError(response: KyResponse): Promise<ResultType> {
    let val: SupportedPayloadType = '';
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
      var v = val as { success: boolean };
      successTrueOrEmpty = !v || v.success;
    }

    return new RequestResult(response.ok && !err && successTrueOrEmpty, response.status, val);
  }

  private async execWithRetryOn401(
    request: (url: string, options: Options) => ResponsePromise,
    url: string,
    options: Options)
      : Promise<KyResponse> {

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

  constructor(options?: SecKyOptions) {
    if (options) {
      this._authToken = options.authToken || undefined;
      this._baseUrl = options.authToken || undefined;
      this._reauthAction = options.reauthAction;
    }
    this._reauthAction = undefined!;
    this._policy = options && options.policy || RetryPolicy.createBasic(BasicExecutionPolicy.NoRetry);
  }


  async get(url: string, object: object | undefined, withToken: boolean | undefined): Promise<ResultType> {
    const options = this.getRequestOptions(withToken);
    var response = await this.execWithRetryOn401(ky.get, url, { ...options, json: object });

    var result = this.getResultOrError(response);

    return result;
  }

  async post(url: string, object: object | undefined, withToken: boolean | undefined): Promise<ResultType> {
    const options = this.getRequestOptions(withToken);
    var response = await this.execWithRetryOn401(ky.post, url, { ...options, json: object });

    var result = this.getResultOrError(response);

    return result;
  }

  async put(url: string, object: object | undefined, withToken: boolean | undefined): Promise<ResultType> {
    const options = this.getRequestOptions(withToken);
    var response = await this.execWithRetryOn401(ky.put, url, { ...options, json: object });

    var result = this.getResultOrError(response);

    return result;
  }

  async delete(url: string, object: object | undefined, withToken: boolean | undefined): Promise<ResultType> {
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
export let SecKyInstance: SecKy;

/**
 * Global constructor, initializing instance of SecKyInstance.
 * Requires SecKyOptions to be provided. 
 */
export const createSecKyInstance = (options: SecKyOptions) => {
  SecKyInstance = new SecKy(options);
}



