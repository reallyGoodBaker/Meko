import {IFileSystem} from '@persistence/fileSystem'
import * as path from 'path'
import {createIdentifier} from '@di'

const CONFIG_PATH = path.resolve(__dirname, '../../config')

export interface IConfigurator {
    open(configName: string, removeComments?: boolean): Promise<Config>
}

export const IConfigurator = createIdentifier<IConfigurator>('builtin-Configurator')

export class Configurator implements IConfigurator {

    constructor(
        @IFileSystem private readonly fileSystem: IFileSystem,
        private readonly _configPath: string,
    ) {
        this._init()
    }

    private async _init() {
        if (!this.fileSystem.exists(this._configPath))
            this.fileSystem.mkdir(this._configPath)
    }
 
    async open(configName: string, removeComments=true) {
        const _filePath = path.join(this._configPath, configName)
        let data

        if (this.fileSystem.exists(_filePath)) {
            data = await this.fileSystem.readFile(_filePath, removeComments)
        } else {
            this.fileSystem.writeFile(_filePath, '{}')
            data = {}
        }

        return new Config(data, _filePath, this.fileSystem)
    }
}

class Config {
    private _data: any
    private _configPath = ''
    private _fs: IFileSystem

    constructor(d: any, p: string, fs: IFileSystem) {
        this._data = d
        this._configPath = p
        this._fs = fs
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

    set(obj: any) {
        this._data = obj
        this._writeConfigWhenFree()
    }

    private _writeConfigWhenFree() {
        this._fs.writeFile(this._configPath, this._data)
    }
}

export class MekoConfigurator extends Configurator {
    constructor(
        @IFileSystem private readonly fs: IFileSystem,
    ) {
        super(fs, CONFIG_PATH)
    }
}