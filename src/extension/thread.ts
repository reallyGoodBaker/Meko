import {createIdentifier} from '@di'
import {
    Worker, parentPort, workerData, isMainThread, TransferListItem,
    MessagePort, WorkerOptions
} from 'worker_threads'
import {IFileSystem} from '@persistence/fileSystem'
import * as path from 'path'


export const IPostDataBundle = createIdentifier<IPostDataBundle>('builtin-dataBundle')
export type IPostDataBundle = PostDataBundle
export class PostDataBundle {
    private _data: any[] = []
    private _keys: string[] = []
    private _transferList: TransferListItem[] = []

    constructor(
        private _signal: string = '',
        data?: any
    ) {
        this.put('default', data)
    }
    
    signal(): string
    signal(identifier: string): void
    signal(identifier?: string): void | string {
        if (typeof identifier === 'undefined') {
            return this._signal
        }

        this._signal = identifier
    }


    put(key: string, data: any): void {
        this._keys.push(key)
        this._data.push(data)
    }

    
    putTransferItem(key: string, buf: TransferListItem) {
        this.put(key, buf)
        this._transferList.push(buf)
    }


    get(key: string) {
        const dataCopy = this._data.slice(0)
        const res: any[] = []

        this._keys.forEach((k, i) => {
            if (k !== key) {
                return
            }

            res.push(dataCopy[i])
        })

        return res
    }


    toPostData(): PostData {
        return [{
            signal: this._signal,
            data: this._data,
            keys: this._keys,
            transferList: this._transferList
        }, this._transferList]
    }


    static fromReceivedData(recevData: ReceivedData) {
        const bundle = new PostDataBundle(recevData.signal)
        const {data, keys, transferList} = recevData

        keys.forEach((k, i) => {
            const val = data[i]

            if (transferList.includes(val)) {
                bundle.putTransferItem(k, val)
                return
            }

            bundle.put(k, val)
        })

        return bundle
    }
    
}

export const IBroadcast = createIdentifier<IBroadcast>('builtin-broadcast')
export type IBroadcast = Broadcast
export class Broadcast extends PostDataBundle {
    constructor(data: any) {
        super('broadcast', data)
    }
}


type PostData = [{
    signal: string
    data: any[]
    keys: string[]
    transferList: TransferListItem[]
}, TransferListItem[]]

type ReceivedData = PostData[0]


export const IThread = createIdentifier<IThread>('builtin-thread')
export type IThread = Thread
export class Thread {

    post(val: PostData): boolean
    post(port: MessagePort, val: PostData): boolean
    post(arg0: PostData | MessagePort, arg1?: PostData) {
        if (arg0 instanceof MessagePort) {
            if (typeof arg1 === 'undefined') {
                return false
            }

            arg0.postMessage(...arg1)
            return true
        }

        return this.postChild(arg0)
    }

    postChild(val: PostData) {
        if (!parentPort) {
            return false
        }

        parentPort.postMessage(...val)
        return true
    }

}

class CrossThreadScript {
    
    constructor(
        private funcScript: string,
        private readonly valsMap: {[k: string]: any},
    ) {}

    matchFuncScript() {
        const regExp = /\/\*\*@async\*\/[ ]*?([_a-zA-Z][\w]*)/g
        const script = this.funcScript
        let result
            ,identifierList: string[] = []

        while (result = regExp.exec(script)) {
            this.recordBreakPoints(result)
            identifierList.push(result[1])
        }

        return {
            scriptFragments: this.breakFuncScript(),
            identifierList
        }
    }

    private breakPoints: number[] = []
    recordBreakPoints(result: RegExpExecArray) {
        this.breakPoints.push(result.index, result.index + result[0].length)
    }

    breakFuncScript() {
        let script = this.funcScript
        let fragments: string[] = []

        let startOffset = 0

        this.breakPoints.forEach(i => {
            fragments.push(script.slice(0, i - startOffset))
            script = script.slice(i - startOffset)
            startOffset = i
        })

        fragments.push(script)

        return fragments
    }

    recompileCode() {
        const {identifierList, scriptFragments} = this.matchFuncScript()
        const valsMap = this.valsMap
        const compiledFrags: string[] = []

        scriptFragments.forEach((frag) => {
            compiledFrags.push(
                this.recompileEachFragment(frag, identifierList, valsMap)
            )
        })

        return `(${compiledFrags.join('')})()`
    }

    recompileEachFragment(frag: string, identifierList: string[], map: any) {
        let val: any

        for (const id of identifierList) {
            
            if (frag.endsWith(id)) {
                if ((val = map[id]) !== undefined) {
                    return `let ${id} = (${this.stringifyValue(val)})`
                }

                return frag
            }
        }
        
        return frag
    }

    stringifyValue(val: any) {

        if (val === null) {
            return `null`
        }

        if (typeof val === 'string') {
            return `'${val}'`
        }
        
        if (typeof val !== 'object') {
            return val.toString()
        }

        return this.stringifyObject(val)
    }

    stringifyObject(obj: any) {
        if (this.canConvert(obj)) {
            return this.stringify(obj)
        }
        
        return 'undefined'
    }

    canConvert(obj: any) {
        for (const key of Object.getOwnPropertyNames(obj)) {
            if (typeof obj[key] === 'object') {
                return false
            }
        }

        return true
    }

    stringify(obj: any) {
        let str = '{'
        for (const key of Object.getOwnPropertyNames(obj)) {
            const val = obj[key]
            str += `${key}: (${val.toString()}),`
        }

        return str + '}'
    }

}

export type CrossThread<T> = T
export function CrossThread(bind: any) {
    return (func: string | Function) => {
        if (typeof func === 'function') {
            func = func.toString()
        }

        return (new CrossThreadScript(func, bind)).recompileCode()
    }
}

function generateUid() {
    return `${new Date().getTime()}${~~(Math.random() * 10000)}`
}

export const IMainThread = createIdentifier<IMainThread>('builtin-mainThread')
export type IMainThread = MainThread
export class MainThread {

    constructor(
        @IFileSystem private readonly fs: IFileSystem
    ) {}

    assertMainThread() {
        if (!isMainThread) {
            throw 'not main thread'
        }
    }

    post(port: MessagePort, val: PostData) {
        this.assertMainThread()
        port.postMessage(...val)
    }

    runFile(filename: string | URL, opt?: WorkerOptions) {
        this.assertMainThread()
        return new Worker(filename, opt)
    }

    async run(script: StringLike, opt?: WorkerOptions) {
        const cachePath = path.resolve(__dirname, '../../cache')
        const filePath = path.join(cachePath, generateUid())

        if (!this.fs.exists(cachePath)) {
            await this.fs.mkdir(cachePath)
        }

        await this.fs.writeFile(filePath, script)

        return new Worker(filePath, opt)
    }
}

type StringLike = {
    toString(): string
}