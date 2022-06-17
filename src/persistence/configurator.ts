import {fileSystem} from '@persistence/fileSystem'
import * as path from 'path'

const CONFIG_PATH = path.resolve(__dirname, '../../config')

class Configurator {
    constructor() {
        this._init()
    }

    private async _init() {
        if (!fileSystem.exists(CONFIG_PATH))
            fileSystem.mkdir(CONFIG_PATH)
    }
 
    async open(configName: string, removeComments=true) {
        const _filePath = path.join(CONFIG_PATH, configName)
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

    val() {
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