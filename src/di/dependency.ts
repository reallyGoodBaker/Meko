import { ServiceCollection } from '@di/store'

export class Dependency {
    private _deps: any[] = []

    set(index: number, serviceKey: string) {
        this._deps[index] = serviceKey
    }

    get() {
        return this._deps
    }
}

export const _deps = new Map<any, Dependency>()

export function storeDependency(target: any, index: number, key: string) {
    let dep = _deps.get(target)

    if (!dep) {
        dep = new Dependency()
    }

    dep.set(index, key)

    _deps.set(target, dep!)
}

export function valideDependencies(target: any, col: ServiceCollection, exists: any[] = [], check?: any) {
    const deps = _deps.get(target)

    if (!check) {
        check = target
    }

    if (!deps) {
        return true
    }

    for (const dep of deps.get() as string[]) {
        const desc = col.get(dep)

        if (!desc) {
            throw ReferenceError('No corresponding target found in collection')
        }

        if (exists.includes(check)) {
            exists = exists.map(c => c.name)
            throw new CircularDependencyError(exists)
        }

        exists.push(desc.ctor)
        valideDependencies(desc.ctor, col, exists, check)
    }

    return true

}


class CircularDependencyError extends Error {
    constructor(arr: string[]) {
        super(`Find circular dependencies: ${arr.join(', ')}`)
    }
}