import {fileSystem} from './fileSystem'
import * as path from 'path'

const CONFIG_PATH = path.resolve(__dirname, '../../config')

class Configurator {
    private _data: any
    private _configPath = ''

    async open(configName: string, removeComments=true) {
        const _filePath = path.join(CONFIG_PATH, configName)

        this._configPath = _filePath

        if (!fileSystem.exists(_filePath)) {
            return null
        }

        this._data = await fileSystem.readFile(_filePath, removeComments)

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