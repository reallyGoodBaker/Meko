import {InstantiationService, ServiceCollection} from '@di'
import {IConfigurator, Configurator} from '@persistence/configurator'
import {IFileSystem, FileSystem} from '@persistence/fileSystem'

const instantiationService = new InstantiationService(
    new ServiceCollection([
        [IConfigurator, Configurator],
        [IFileSystem, FileSystem],
    ])
)

class App {
    constructor(
        @IConfigurator private readonly configurator: IConfigurator,
    ) {}

    async startApp() {
        const [config] = await Promise.all([
            this.configurator.open('botConfig.json'),
        ])

        console.log(config.val());
    }
}

instantiationService.createInstance<App>(App).startApp()