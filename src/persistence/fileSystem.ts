import * as fs from 'fs'
import { promisify } from 'util'
import {createIdentifier} from '@di'

type Convertable = boolean | null | number | string | object

const _writeFile = promisify(fs.writeFile)
const _readFile = promisify(fs.readFile)
const _appendFile = promisify(fs.appendFile)
const _mkdir = promisify(fs.mkdir)

export interface IFileSystem {
    mkdir(path: string, options?: any): Promise<any>
    exists(filePath: string): boolean
    writeFile(filePath: string, data: Convertable): Promise<void>
    readFile(filePath: string, removeComments?: boolean): Promise<any>
    appendFile(filePath: string, data: string | Uint8Array): Promise<void>
    watch(filePath: string, onchange: (type: string, filePath: string) => void): fs.FSWatcher
}

export const IFileSystem = createIdentifier<IFileSystem>('builtin-fs')

export class FileSystem implements IFileSystem {

    
    mkdir = _mkdir
    appendFile = _appendFile
    watch = fs.watch

    exists(filePath: string) {
        return fs.existsSync(filePath)
    }

    async writeFile(filePath: string, data: Convertable) {
        const str = JSON.stringify(data, null, 4)

        await _writeFile(filePath, str)
    }

    async readFile(filePath: string, removeComments=true) {
        let str = (await _readFile(filePath)).toString()
        
        if (removeComments) {
            str = str.replace(/\/\/.*[\n\r]/g, '')
                     .replace(/[\s]\/\*[\s|\S]*?\*\//g, '')
        }

        return JSON.parse(str)
    }

}