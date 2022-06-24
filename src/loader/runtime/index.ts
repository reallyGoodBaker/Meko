import {parentPort, MessagePort} from 'worker_threads'
import {EventEmitter} from 'events'

function sendMsg(...args: any[]) {
    parentPort?.postMessage(args)
}

class IpcPlugin extends EventEmitter {

    provided: any = {}

    constructor() {
        super()
        const self = this

        parentPort?.on('message', (val: [string, ...any[]]) => {
            if (Array.isArray(val)) {
                if (val[0].startsWith('consumer')) {
                    self.emit('consumer', val[1])
                } else {
                    self.emit(...val)
                }
            }
        })

        this.on('consumer', port => {
            this.createProvider(port)
        })
    }

    createProvider(port: MessagePort) {
        let provider = new Provider(port)
        provider.provide(this.provided)
        providers.push(provider)
    }

    getProviderPort(id: string): Promise<MessagePort | null> {
        sendMsg(`link:${id}`)
        return new Promise(s => {
            this.once(`provider:${id}`, port => {
                s(port)
            })

            setTimeout(() => {
                s(null)
            }, 200);
        })
    }

    setProvided(obj: any) {        
        for (const key of Object.keys(obj)) {
            this.provided[key] = obj[key]
        }
    }

}

const ipc = new IpcPlugin()

export async function register(id: string): Promise<boolean> {
    return new Promise(r => {
        const timer = setTimeout(() => {
            r(false)
        }, 200)

        parentPort?.postMessage(id)
        parentPort?.once('message', msg => {
            clearTimeout(timer)
            r(msg)
        })
    })
}

class Consumer extends EventEmitter {
    private _port: MessagePort

    constructor(port: MessagePort) {
        super()
        this._port = port

        port.on('message', (val: [string, ...any[]]) => {
            this.emit(...val)
        })
    }

    async call(method: string, ...args: any[]) {
        const funcId = `${method}-${this.eventNames().length}`,
            callId = `call:${funcId}`,
            errId = `err:${funcId}`,
            returnId = `return:${funcId}`

        this._port.postMessage([callId, ...args])
        

        return new Promise((s, j) => {
            this.once(returnId, returnVal => {
                s(returnVal)
            })
            this.once(errId, err => {
                j(err)
            })
        })
    }

    getAgent() {
        let self = this
        return new Proxy({}, {
            get(t, p) {
                if (typeof p === 'symbol') {
                    return undefined
                }

                return (...args: any[]) => {
                    self.call(p, ...args)
                }
            },

            set() {
                return false
            }
        })
    }
}

class Provider extends EventEmitter {
    private _port: MessagePort
    private _callable: any = {}

    private _handleErr(funcId: string, err: Error) {
        this._port.postMessage([`err:${funcId}`, err])
    }

    constructor(port: MessagePort) {
        super()
        this._port = port
        port.on('message', (val: [string, ...any[]]) => {            
            const [info, ...args] = val
            const matcher = /(.*):(.*)-(.*)/g

            const res = matcher.exec(info)
            if (!res) {
                return
            }

            const [_, action, method, id] = res

            if (action === 'call') {
                const func = this._callable[method]
                const funcId = method + '-' + id

                if (!func) {
                    this._handleErr(funcId, ReferenceError(`'${method}' is not defined`))
                    return
                }

                let returnVal

                try {
                    returnVal = func.apply(null, args)
                } catch (error) {
                    this._handleErr(funcId, error as Error)
                    return
                }

                this._port.postMessage([`return:${funcId}`, returnVal])
            }
        })
    }

    provide(obj: any) {
        for (const k of Object.keys(obj)) {
            const val = obj[k]
            if (typeof val === 'function') {
                this._callable[k] = (...args: any[]) => val.apply(obj, args)
            }
        }  
    }
}

let consumers = [],
    providers: any[] = []

export function provide(obj: any) {
    ipc.setProvided(obj)
}

export async function getProvider(id: string) {
    const port = await ipc.getProviderPort(id)

    if (!port) {
        return null
    }

    const consumer = new Consumer(port)
    consumers.push(consumer)

    return consumer
}