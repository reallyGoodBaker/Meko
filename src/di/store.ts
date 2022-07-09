import type { Identifier, Descriptor, ServiceCollectionOpt } from '@di/types'

function createDescriptor<T>(service: any, singleton: boolean = true, staticArgs: any[] = []): Descriptor<T> {
    const desc = {
        ctor: service,
        singleton,
        staticArguments: staticArgs
    }

    return desc
}

export const _identifiers = new Map<string, Identifier<any>>()

export class ServiceCollection {
    private _entries = new Map<string, Descriptor<any>>()

    constructor(singletonOpt?: ServiceCollectionOpt, basicOpt?: ServiceCollectionOpt) {
        if (Array.isArray(singletonOpt)) {
            for (const _opt of singletonOpt) {
                const [id, ctor, args] = _opt
                this.setSingleton(id, ctor, args)
            }
        }

        if (Array.isArray(basicOpt)) {
            for (const _opt of basicOpt) {
                const [id, ctor, args] = _opt
                this.set(id, ctor, args)
            }
        }
    }

    setSingleton(id: Identifier<any> | string, service: any, args: any[] = []) {
        this._entries.set(
            typeof id === 'string' ? id : id._key,
            createDescriptor(service, true, args)
        )
        return this
    }

    set(id: Identifier<any> | string, service: any, args: any[] = []) {
        this._entries.set(typeof id === 'string' ? id : id._key, createDescriptor(service, false, args))
        return this
    }

    get(id: Identifier<any> | string) {
        return this._entries.get(typeof id === 'string' ? id : id._key)
    }

    has(id: Identifier<any> | string) {
        return this._entries.has(typeof id === 'string' ? id : id._key)
    }
}
