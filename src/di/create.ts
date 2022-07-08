import {_deps, ServiceCollection, _identifiers} from '@di/store'
import {Identifier} from '@di/types'
import {createIdentifier} from '@di/identifier'

function _gatherDeps(service: any) {
    const dep = _deps.get(service)

    if (!dep) {
        return null
    }

    return dep
}

const _store = new Map<string, any>()

interface IInstantiationService {
    createInstance<T>(service: any, args?: any[]): T;
    invoke(func: (accessor: {get(key: string, args?: any[]): any}) => void): void;
}

export const IInstantiationService = createIdentifier<IInstantiationService>('builtin-InstantiationService')

export class InstantiationService implements IInstantiationService {
    private _collection: ServiceCollection

    constructor(collection: ServiceCollection) {
        this._collection = collection
    }


    private _getOrCreateServiceByKey(key: string, args: any[] = []) {
        if (_store.has(key)) {
            return _store.get(key)
        }

        if (!this._collection.has(key)) {
            return undefined
        }

        const ctor = this._collection.get(key)

        const _service = this._createInstance(ctor, args)

        _store.set(key, _service)

        return _service
    }


    private _createInstance<T>(service: any, args: any[] = []): T {
        let deps = _gatherDeps(service)?.get().map(key => this._getOrCreateServiceByKey(key))!

        if (!deps) {
            deps = []
        }

        return <T>Reflect.construct(service, [...deps, ...args])
    }


    createInstance<T>(service: any, args: any[] = []): T {
        return this._createInstance(service, args)
    }


    invoke(func: (accessor: {get(key: string, args?: any[]): any}) => void) {
        const self = this

        Reflect.apply(func, undefined, [{
            get(k: string, args: any[] = []) {
                return self._getOrCreateServiceByKey(k, args)
            }
        }])
    }
}