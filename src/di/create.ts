import { ServiceCollection, _identifiers } from '@di/store'
import { _deps, valideDependencies } from '@di/dependency'
import { createIdentifier } from '@di/identifier'
import { Identifier } from '@di/types'

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
    invoke(func: (accessor: { get(key: string, args?: any[]): any }) => void): void;
    getCollection(): ServiceCollection;
}

export const IInstantiationService = createIdentifier<IInstantiationService>('builtin-InstantiationService')

export class InstantiationService implements IInstantiationService {
    private _collection: ServiceCollection

    constructor(collection: ServiceCollection) {
        this._collection = collection
    }

    getCollection() {
        return new Proxy(this._collection, {
            set() {
                return false
            },

            get(t, p: keyof ServiceCollection) {
                return t[p]
            }
        })
    }

    private _getOrCreateServiceByKey(key: string, args: any[] = []) {
        if (!this._collection.has(key)) {
            return null
        }

        const desc = this._collection.get(key)

        if (!desc) {
            return null
        }

        const { ctor, singleton, staticArguments } = desc

        if (singleton && _store.has(key)) {
            return _store.get(key)
        }

        const _service = this._createInstance(
            ctor, args.length ? args : staticArguments
        )

        if (singleton) {
            _store.set(key, _service)
        }

        return _service
    }


    protected _createInstance<T>(service: any, args: any[] = []): T | null {
        try {
            valideDependencies(service, this._collection)
        } catch (err) {
            this.onError.call(this, err)
        }

        let deps = _gatherDeps(service)?.get().map(key => this._getOrCreateServiceByKey(key))

        if (!deps) {
            deps = []
        }

        return <T>Reflect.construct(service, [...deps, ...args])
    }


    createInstance<T>(service: any, args: any[] = []): T {
        return this._createInstance(service, args)!
    }


    invoke(func: (accessor: { get<T>(key: string, args?: any[]): T }) => void) {
        const self = this

        Reflect.apply(func, undefined, [{
            get(k: string, args: any[] = []) {
                return self._getOrCreateServiceByKey(k, args)
            }
        }])
    }

    /**
     * @override
     */
    onError(err: any) {
        console.error(err)
    }


    register(id: Identifier<any>, service: any, args: any[] = []) {
        this._collection.set(id, service, args)
        return this
    }

    registerSingleton(id: Identifier<any>, service: any, args: any[] = []) {
        this._collection.setSingleton(id, service, args)
        return this
    }
}