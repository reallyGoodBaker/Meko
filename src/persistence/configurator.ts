import {fileSystem} from '@persistence/fileSystem'
import * as path from 'path'

const CONFIG_PATH = path.resolve(__dirname, '../../config')

export class Configurator {
    private _configPath: string

    constructor(configPath=CONFIG_PATH) {
        this._configPath = configPath
        this._init()
    }

    private async _init() {
        if (!fileSystem.exists(this._configPath))
            fileSystem.mkdir(this._configPath)
    }
 
    async open(configName: string, removeComments=true) {
        const _filePath = path.join(this._configPath, configName)
        let data

        if (fileSystem.exists(_filePath)) {
            data = await fileSystem.readFile(_filePath, removeComments)
        } else {
            fileSystem.writeFile(_filePath, '{}')
            data = {}
        }

        return new Config(data, _filePath)
    }
}

class Config {
    private _data: any
    private _configPath = ''

    constructor(d: any, p: string) {
        this._data = d
        this._configPath = p
    }

    val(key?: string) {
        if (typeof key === 'string') {
            return this._data[key]
        }
        return Object.assign({}, this._data)
    }

    merge(obj: any) {
        this._data = Object.assign(this._data, obj)
        this._writeConfigWhenFree()
    }

    private _writeConfigWhenFree() {
        requestIdleCallback(() => {
            fileSystem.writeFile(this._configPath, this._data)
        })
    }
}

export const configurator = new Configurator()