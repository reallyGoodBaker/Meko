import {_deps, ServiceCollection, _identifiers} from '@di/store'
import {Identifier} from '@di/types'

function _gatherDeps(service: any) {
    const dep = _deps.get(service)

    if (!dep) {
        return null
    }

    return dep
}

const _store = new Map<string, any>()

export class InstantiationService {
    private _collection: ServiceCollection

    constructor(collection: ServiceCollection) {
        this._collection = collection
    }


    private _getOrCreateServiceByKey(key: string) {
        if (_store.has(key)) {
            return _store.get(key)
        }

        if (!this._collection.has(key)) {
            return undefined
        }

        const ctor = this._collection.get(key)

        const _service = this._createInstance(ctor)

        _store.set(key, _service)

        return _service
    }


    private _createInstance<T>(service: any, args: any[] = []): T {
        let deps = _gatherDeps(service)?.get().map(key => this._getOrCreateServiceByKey(key))!

        if (!deps) {
            deps = []
        }

        return <T>Reflect.construct(service, [...args, ...deps])
    }


    createInstance<T>(service: any, args: any[] = []): T {
        return this._createInstance(service, args)
    }
}