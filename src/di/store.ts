import type {Identifier, SyncDescriptor} from '@di/types'

class Dependency {
    private _deps: any[] = []

    set(index: number, serviceKey: string) {
        this._deps[index] = serviceKey
    }

    get() {
        return this._deps
    }
}

export const _deps = new Map<any, Dependency>()
export const _identifiers = new Map<string, Identifier<any>>()

export function storeDependency(target: any, index: number, key: string) {
    let dep = null

    if (_deps.has(target)) {
        dep = _deps.get(target)
    } else {
        dep = new Dependency()
    }

    dep?.set(index, key)

    _deps.set(target, dep!)
}

export class ServiceCollection {
    private _entries = new Map<string, any>()

    constructor(opt?: [Identifier<any>, any][]) {
        if (Array.isArray(opt)) {
            for (const [id, ctor] of opt) {
                this.set(id, ctor)
            }
        }
    }

    set(id: Identifier<any>, service: any) {
        this._entries.set(id._key, service)
        return this
    }

    get(id: any) {
        return this._entries.get(id)
    }

    has(id: any) {
        return this._entries.has(id)
    }
}
