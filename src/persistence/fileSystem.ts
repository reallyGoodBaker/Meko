import * as fs from 'fs'
import { promisify } from 'util'

type Convertable = boolean | null | number | string | object

const _writeFile = promisify(fs.writeFile)
const _readFile = promisify(fs.readFile)

class FileSystem {

    
    mkdir = promisify(fs.mkdir)

    exists(filename: string) {
        return fs.existsSync(filename)
    }

    async writeFile(filename: string, data: Convertable) {
        const str = JSON.stringify(data, null, 4)

        await _writeFile(filename, str)
    }

    async readFile(filename: string, removeComments=true) {
        let str = (await _readFile(filename)).toString()
        
        if (removeComments) {
            str = str.replace(/\/\/.*[\n\r]/g, '')
                     .replace(/[\s]\/\*[\s|\S]*?\*\//g, '')
        }

        return JSON.parse(str)
    }

}

export const fileSystem = new FileSystem()