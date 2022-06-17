import {ipc} from '@runtime/ipc'
import {parentPort} from 'worker_threads'

export async function register(id: string) {
    return new Promise(r => {
        parentPort?.postMessage(id)
        parentPort?.on('message', msg => {
            r(msg)
        })
    })
}

export function provide(obj: any) {
    for (const k of Object.keys(obj)) {
        const val = obj[k]
        if (typeof val === 'function') {
            ipc.on(k, (...args: any) => {
                val.apply(obj, args)
            })
        }
    }   
}

export function send(...args: any[]) {
    ipc.send(...args)
}