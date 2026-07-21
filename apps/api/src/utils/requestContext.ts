import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContextData {
  requestId: string;
  userId?: string;
  [key: string]: unknown;
}

export class RequestContext {
  private static storage = new AsyncLocalStorage<RequestContextData>();

  static run(data: RequestContextData, callback: () => void): void {
    this.storage.run(data, callback);
  }

  static runAsync<T>(data: RequestContextData, callback: () => Promise<T>): Promise<T> {
    return this.storage.run(data, callback);
  }

  static get(): RequestContextData | undefined {
    return this.storage.getStore();
  }

  static getRequestId(): string | undefined {
    return this.get()?.requestId;
  }
}
