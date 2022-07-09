export interface Identifier<T> {
    readonly _key: string;
    (target: any, key: string, index: number): void;
}

export interface Descriptor<T> {
    readonly ctor: new(...args: any[]) => T;
    readonly staticArguments: any[];
    readonly singleton: boolean;
}

export type ServiceCollectionOpt = [Identifier<any>, any, any[]?][]