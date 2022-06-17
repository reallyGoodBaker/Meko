import {EventEmitter} from 'events'
import {Worker} from 'worker_threads'


class IpcMain extends EventEmitter {

    instanceStore: Map<string, Worker> = new Map()

    init(i: Map<string, Worker>) {
        i.forEach((v, k) => {
            this.addPluginIpc(k, v)
        })

        this.instanceStore = i
    }

    private _setupNewWorker(id: string, worker: Worker) {
        worker.on('message', (data: any[]) => {
            this.emit(id, ...data)
        })
        worker.on('exit', () => {
            this.instanceStore.delete(id)
        })
    }

    addPluginIpc(id: string, worker: Worker) {
        this.instanceStore.set(id, worker)
        this._setupNewWorker(id, worker)
    }

    send(accessor: string, ...args: any[]) {
        if (!this.instanceStore) return

        const [id, apiKey] = accessor.split('.')
        args.unshift(apiKey)
        this.instanceStore.get(id)?.postMessage(args)
    }

}


export const ipc = new IpcMain()