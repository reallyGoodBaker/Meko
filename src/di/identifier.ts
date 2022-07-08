import {storeDependency, _identifiers} from '@di/store'
import type {Identifier} from '@di/types'

export function createIdentifier<T>(key: string): Identifier<T> {
    if (_identifiers.has(key)) {
        return _identifiers.get(key)!
    }

    const id = function(target: any, _: string, index: number) {
        if (arguments.length !== 3) {
            throw 'Identifier can only be used as a decorator in a class constructor'
        }

        storeDependency(target, index, key)
    }

    id._key = key

    _identifiers.set(key, id)

    return id
}
