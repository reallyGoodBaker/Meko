import {EventEmitter} from 'events'
import {parentPort} from 'worker_threads'

class IpcPlugin extends EventEmitter {

    constructor() {
        super()

        parentPort?.on('message', (val: [string, ...any[]]) => {
            if (Array.isArray(val)) {
                this.emit(...val)
            }
        })
    }

    send(...args: any[]) {
        parentPort?.postMessage(args)
    }


}

export const ipc = new IpcPlugin()