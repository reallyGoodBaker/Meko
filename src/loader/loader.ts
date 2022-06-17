import {ipc} from '@loader/ipcMain'
import {Worker} from 'worker_threads'

const workers = new Map<string, Worker>()

class PluginLoader {
    setupPlugin(filename: string, opt={}) {
        const worker = new Worker(filename, opt)
        worker.once('message', v => {
            if (workers.has(v)) {
                worker.postMessage(false)
                worker.terminate()
            } else {
                worker.postMessage(true)
                ipc.addPluginIpc(v, worker)
            }
        })
    }
}

export const pluginLoader = new PluginLoader()