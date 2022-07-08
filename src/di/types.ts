export interface Identifier<T> {
    readonly _key: string;
    (target: any, key: string, index: number): void;
}

export interface SyncDescriptor<T> {
    (...args: any[]): T
}