export declare class RequestContextService {
    private readonly storage;
    run<T>(callback: () => T): T;
    getRequestId(): string;
    setRequestId(requestId: string): void;
}
