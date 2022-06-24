import EventEmitter from 'events'
import {Worker, WorkerOptions, MessageChannel, markAsUntransferable} from 'worker_threads'
import * as path from 'path'

class PluginLoader extends EventEmitter {

    private _ports: Map<string, Worker> = new Map()

    private _setupNewWorker(id: string, worker: Worker) {
        worker.on('message', (data: [string, ...any[]]) => {            
            if (!this._dispatchRpc(id, ...data)) {
                this.emit(id, ...data)
            }
        })
        worker.on('exit', () => {
            this._ports.delete(id)
        })
        worker.on('error', () => {
            this._ports.delete(id)
        })
    }

    private _dispatchRpc(id: string, command: string, ...argv: any) {
        const [cmd, _args] = command.split(':'),
            args = _args.split(',')


        if (!args) {
            return false
        }

        switch (cmd) {
            case 'link':
                this.linkTo(id, args[0])
                return true
        
            default:
                return false
        }
    }

    private addPlugin(id: string, worker: Worker) {
        this._ports.set(id, worker)
        this._setupNewWorker(id, worker)
    }

    rmPlugin(id: string) {
        if (this._ports.has(id)) {
            this._ports.get(id)?.terminate()
                .catch(er => this.emit('error', er))
            this._ports.delete(id)
        }
    }

    linkTo(id1: string, id2: string) {
        const caller = this._ports.get(id1)
        if (this._ports.has(id2)) {
            const callee = this._ports.get(id2)
            const channel = new MessageChannel()

            caller?.postMessage([`provider:${id2}`, channel.port1], [channel.port1])
            callee?.postMessage([`consumer:${id1}`, channel.port2], [channel.port2])
            return
        }

        caller?.postMessage([`err:${id2}`, ReferenceError(`Plugin "${id2}" does not exist.`).stack])
    }

    setupPlugin(filename: string, opt: WorkerOptions = {
        // stdout: true,
        // stdin: true,
        // stderr: true
    }) {
        const worker = new Worker(filename, opt)
        const overtimeWatcher = setTimeout(() => {
            worker.terminate()
        }, 200)

        worker.once('message', v => {
            if (this._ports.has(v)) {
                worker.postMessage(false)
            } else {
                clearTimeout(overtimeWatcher)
                worker.postMessage(true)
                this.addPlugin(v, worker)
            }
        })
        
    }

}


export const pluginLoader = new PluginLoader()