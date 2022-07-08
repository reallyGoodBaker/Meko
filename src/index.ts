import {InstantiationService, ServiceCollection} from '@di'
import {IConfigurator, Configurator} from '@persistence/configurator'
import {IFileSystem, FileSystem} from '@persistence/fileSystem'

const col = new ServiceCollection([
    [IConfigurator, Configurator],
    [IFileSystem, FileSystem],
])

const service = new InstantiationService(col)

class App {
    constructor(
        @IConfigurator private readonly configurator: IConfigurator
    ) {}

    async startApp() {
        const [config] = await Promise.all([
            this.configurator.open('botConfig.json')
        ])

        console.log(config.val());
    }
}

service.createInstance<App>(App).startApp()